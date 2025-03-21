import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DailyRecordCreateInputDto } from './dtos/daily-record-create.input.dto';
import { DailyRecordUpdateInputDto } from './dtos/daily-record-update.input.dto';
import { User, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { DailyRecordDto } from './dtos/daily-record.output.dto';
import { DailyRecordListResponseDto } from './dtos/daily-record-list.output.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { PineconeService } from 'src/pinecone.service';
import { formatDailyRecord } from './llm/format';
import type { Document } from '@langchain/core/documents';
import { DailyRecordExtractedDto } from './dtos/daily-record-extracted.output.dto';
@Injectable()
export class DailyRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pineconeService: PineconeService,
  ) {}

  async findByResident(
    residentUid: string,
    currentUser: User,
  ): Promise<DailyRecordListResponseDto> {
    const resident = await this.prisma.resident.findUnique({
      where: { uid: residentUid },
    });
    if (!resident) {
      throw new NotFoundException(`Resident with uid ${residentUid} not found`);
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ取得可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      resident.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を取得する権限がありません',
      );
    }

    const [items, total] = await Promise.all([
      this.prisma.dailyRecord.findMany({
        where: { residentUid },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.dailyRecord.count({
        where: { residentUid },
      }),
    ]);

    return {
      items: plainToInstance(DailyRecordDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async findOne(uid: string, currentUser: User): Promise<DailyRecordDto> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { uid },
    });
    if (!record) {
      throw new NotFoundException(`Daily record with uid ${uid} not found`);
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ取得可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      record.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を取得する権限がありません',
      );
    }

    return plainToInstance(DailyRecordDto, record, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    input: DailyRecordCreateInputDto,
    currentUser: User,
  ): Promise<DailyRecordDto> {
    const resident = await this.prisma.resident.findUnique({
      where: { uid: input.residentUid },
    });
    if (!resident) {
      throw new NotFoundException(
        `Resident with uid ${input.residentUid} not found`,
      );
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ作成可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      resident.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を作成する権限がありません',
      );
    }

    const record = await this.prisma.dailyRecord.create({
      data: {
        recordedAt: input.recordedAt ?? new Date(),
        notes: input.notes,
        dailyStatus: input.dailyStatus,
        tenant: {
          connect: {
            uid: resident.tenantUid,
          },
        },
        resident: {
          connect: {
            uid: input.residentUid,
          },
        },
        caregiver: {
          connect: {
            uid: currentUser.uid,
          },
        },
      },
    });

    const vectors = await this.pineconeService.vectorStore.similaritySearch(
      record.uid,
    );
    if (vectors.length > 0) {
      await this.pineconeService.vectorStore.delete({
        ids: vectors.map((v) => v.id),
      });
    }
    const formattedRecord = formatDailyRecord(record, resident);
    const document: Document = {
      id: record.uid,
      pageContent: formattedRecord,
      metadata: {
        source: 'daily-record',
        uid: record.uid,
        tenantUid: record.tenantUid,
      },
    };

    await this.pineconeService.vectorStore.addDocuments([document]);

    return plainToInstance(DailyRecordDto, record, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    input: DailyRecordUpdateInputDto,
    currentUser: User,
  ): Promise<DailyRecordDto> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { uid },
    });
    if (!record) {
      throw new NotFoundException(`Daily record with uid ${uid} not found`);
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ更新可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      record.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を更新する権限がありません',
      );
    }

    // CAREGIVERは自身が作成した記録のみ更新可能
    if (
      currentUser.role === UserRole.CAREGIVER &&
      record.caregiverUid !== currentUser.uid
    ) {
      throw new UnauthorizedException(
        '他の介護者の記録を更新する権限がありません',
      );
    }

    // 24時間以内の記録のみ更新可能
    const now = new Date();
    const recordDate = new Date(record.recordedAt);
    const hoursDiff = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      throw new BadRequestException(
        '作成から24時間以上経過した記録は更新できません',
      );
    }

    const updatedRecord = await this.prisma.dailyRecord.update({
      where: { uid },
      data: input,
    });

    return plainToInstance(DailyRecordDto, updatedRecord, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { uid },
    });
    if (!record) {
      throw new NotFoundException(`Daily record with uid ${uid} not found`);
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ削除可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      record.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を削除する権限がありません',
      );
    }

    // CAREGIVERは記録を削除不可
    if (currentUser.role === UserRole.CAREGIVER) {
      throw new UnauthorizedException('介護者は記録を削除できません');
    }

    await this.prisma.dailyRecord.delete({ where: { uid } });
  }

  // 文字起こし関連のメソッド
  async getTranscription(
    uid: string,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`日常記録が見つかりません（UID: ${uid}）`);
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ取得可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      record.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を取得する権限がありません',
      );
    }

    return plainToInstance(TranscriptionDto, record, {
      excludeExtraneousValues: true,
    });
  }

  async appendTranscription(
    uid: string,
    input: TranscriptionInputDto,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`日常記録が見つかりません（UID: ${uid}）`);
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ更新可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      record.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を更新する権限がありません',
      );
    }

    const updatedRecord = await this.prisma.dailyRecord.update({
      where: { uid },
      data: {
        transcription: record.transcription
          ? `${record.transcription}\n${input.transcription}`
          : input.transcription,
      },
      select: { transcription: true },
    });

    return plainToInstance(TranscriptionDto, updatedRecord, {
      excludeExtraneousValues: true,
    });
  }

  async updateTranscription(
    uid: string,
    input: TranscriptionInputDto,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`日常記録が見つかりません（UID: ${uid}）`);
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ更新可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      record.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を更新する権限がありません',
      );
    }

    const updatedRecord = await this.prisma.dailyRecord.update({
      where: { uid },
      data: {
        transcription: input.transcription,
      },
      select: { transcription: true },
    });

    return plainToInstance(TranscriptionDto, updatedRecord, {
      excludeExtraneousValues: true,
    });
  }

  async deleteTranscription(uid: string, currentUser: User): Promise<void> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`日常記録が見つかりません（UID: ${uid}）`);
    }

    // GLOBAL_ADMIN以外は自身のテナントの記録のみ更新可能
    if (
      currentUser.role !== UserRole.GLOBAL_ADMIN &&
      record.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を更新する権限がありません',
      );
    }

    await this.prisma.dailyRecord.update({
      where: { uid },
      data: {
        transcription: null,
      },
    });
  }

  async extractDailyRecord(
    uid: string,
    currentUser: User,
  ): Promise<DailyRecordExtractedDto> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { uid },
    });
    if (!record) {
      throw new NotFoundException(`Daily record with uid ${uid} not found`);
    }

    if (record.tenantUid !== currentUser.tenantUid) {
      throw new UnauthorizedException(
        '他のテナントの利用者の記録を取得する権限がありません',
      );
    }

    return plainToInstance(DailyRecordExtractedDto, record, {
      excludeExtraneousValues: true,
    });
  }
}
