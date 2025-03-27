import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BathRecordCreateInputDto } from './dtos/bath-record-create.input.dto';
import { BathRecordUpdateInputDto } from './dtos/bath-record-update.input.dto';
import { User, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { BathRecordDto } from './dtos/bath-record.output.dto';
import { BathRecordListResponseDto } from './dtos/bath-record-list.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { extractData } from './llm/extractor';
import { BathRecordExtractedDto } from './dtos/bath-record-extracted.output.dto';
import { checkPermission } from 'src/common/permission';
@Injectable()
export class BathRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByResident(
    residentUid: string,
    currentUser: User,
  ): Promise<BathRecordListResponseDto> {
    const resident = await this.prisma.resident.findUniqueOrThrow({
      where: { uid: residentUid },
    });

    checkPermission(currentUser, resident.tenantUid);

    const [items, total] = await Promise.all([
      this.prisma.bathRecord.findMany({
        where: { residentUid },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.bathRecord.count({
        where: { residentUid },
      }),
    ]);

    return {
      items: plainToInstance(BathRecordDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async create(
    input: BathRecordCreateInputDto,
    currentUser: User,
  ): Promise<BathRecordDto> {
    const resident = await this.prisma.resident.findUniqueOrThrow({
      where: { uid: input.residentUid },
    });

    checkPermission(currentUser, resident.tenantUid);

    const record = await this.prisma.bathRecord.create({
      data: {
        recordedAt: input.recordedAt ?? new Date(),
        notes: input.notes,
        bathMethod: input.bathMethod,
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

    return plainToInstance(BathRecordDto, record, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    input: BathRecordUpdateInputDto,
    currentUser: User,
  ): Promise<BathRecordDto> {
    const record = await this.prisma.bathRecord.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, record.tenantUid);

    // CAREGIVERは自身が作成した記録のみ更新可能
    if (
      currentUser.role === UserRole.CAREGIVER &&
      record.caregiverUid !== currentUser.uid
    ) {
      throw new ForbiddenException(
        '他の介護者の記録を更新する権限がありません',
      );
    }

    // 24時間以内の記録のみ更新可能
    const now = new Date();
    const recordDate = new Date(record.recordedAt);
    const hoursDiff = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      throw new ForbiddenException(
        '作成から24時間以上経過した記録は更新できません',
      );
    }

    const updatedRecord = await this.prisma.bathRecord.update({
      where: { uid },
      data: input,
    });

    return plainToInstance(BathRecordDto, updatedRecord, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const record = await this.prisma.bathRecord.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, record.tenantUid);

    await this.prisma.bathRecord.delete({ where: { uid } });
  }

  // 文字起こし関連のメソッド
  async getTranscription(
    uid: string,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.bathRecord.findUniqueOrThrow({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    checkPermission(currentUser, record.tenantUid);

    return plainToInstance(TranscriptionDto, record, {
      excludeExtraneousValues: true,
    });
  }

  async appendTranscription(
    uid: string,
    input: TranscriptionInputDto,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.bathRecord.findUniqueOrThrow({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    checkPermission(currentUser, record.tenantUid);

    const updatedRecord = await this.prisma.bathRecord.update({
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
    const record = await this.prisma.bathRecord.findUniqueOrThrow({
      where: { uid },
      select: { tenantUid: true, residentUid: true },
    });

    checkPermission(currentUser, record.tenantUid);

    const updatedRecord = await this.prisma.bathRecord.update({
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
    const record = await this.prisma.bathRecord.findUniqueOrThrow({
      where: { uid },
      select: { tenantUid: true, residentUid: true },
    });

    checkPermission(currentUser, record.tenantUid);

    await this.prisma.bathRecord.update({
      where: { uid },
      data: {
        transcription: null,
      },
    });
  }

  async extract(
    uid: string,
    currentUser: User,
  ): Promise<BathRecordExtractedDto> {
    const record = await this.prisma.bathRecord.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, record.tenantUid);

    // 文字起こしデータがない場合はエラー
    if (!record.transcription) {
      throw new BadRequestException('文字起こしデータが存在しません');
    }

    // LLMを使用してデータを抽出
    const extracted = await extractData(record.transcription);

    return plainToInstance(BathRecordExtractedDto, extracted, {
      excludeExtraneousValues: true,
    });
  }
}
