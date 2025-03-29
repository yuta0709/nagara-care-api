import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EliminationRecordCreateInputDto } from './dtos/elimination-record-create.input.dto';
import { EliminationRecordUpdateInputDto } from './dtos/elimination-record-update.input.dto';
import { User, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { EliminationRecordDto } from './dtos/elimination-record.output.dto';
import { EliminationRecordListResponseDto } from './dtos/elimination-record-list.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { checkPermission } from 'src/common/permission';
import { extractData } from './llm/extractor';
import { EliminationRecordExtractedDto } from './dtos/elimination-record-extracted.output.dto';

@Injectable()
export class EliminationRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByResident(
    residentUid: string,
    currentUser: User,
  ): Promise<EliminationRecordListResponseDto> {
    const resident = await this.prisma.resident.findUniqueOrThrow({
      where: { uid: residentUid },
    });

    checkPermission(currentUser, resident.tenantUid);

    const [items, total] = await Promise.all([
      this.prisma.eliminationRecord.findMany({
        where: { residentUid },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.eliminationRecord.count({
        where: { residentUid },
      }),
    ]);

    return {
      items: plainToInstance(EliminationRecordDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async create(
    input: EliminationRecordCreateInputDto,
    currentUser: User,
  ): Promise<EliminationRecordDto> {
    const resident = await this.prisma.resident.findUniqueOrThrow({
      where: { uid: input.residentUid },
    });

    checkPermission(currentUser, resident.tenantUid);

    const record = await this.prisma.eliminationRecord.create({
      data: {
        recordedAt: input.recordedAt ?? new Date(),
        notes: input.notes,
        eliminationMethod: input.eliminationMethod,
        hasFeces: input.hasFeces,
        fecalIncontinence: input.fecalIncontinence,
        fecesAppearance: input.fecesAppearance,
        fecesVolume: input.fecesVolume,
        hasUrine: input.hasUrine,
        urinaryIncontinence: input.urinaryIncontinence,
        urineAppearance: input.urineAppearance,
        urineVolume: input.urineVolume,
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

    return plainToInstance(EliminationRecordDto, record, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    input: EliminationRecordUpdateInputDto,
    currentUser: User,
  ): Promise<EliminationRecordDto> {
    const record = await this.prisma.eliminationRecord.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, record.tenantUid);

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

    const updatedRecord = await this.prisma.eliminationRecord.update({
      where: { uid },
      data: input,
    });

    return plainToInstance(EliminationRecordDto, updatedRecord, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const record = await this.prisma.eliminationRecord.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, record.tenantUid);

    // CAREGIVERは記録を削除不可
    if (currentUser.role === UserRole.CAREGIVER) {
      throw new UnauthorizedException('介護者は記録を削除できません');
    }

    await this.prisma.eliminationRecord.delete({ where: { uid } });
  }

  // 文字起こし関連のメソッド
  async getTranscription(
    uid: string,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.eliminationRecord.findUniqueOrThrow({
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
    const record = await this.prisma.eliminationRecord.findUniqueOrThrow({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    checkPermission(currentUser, record.tenantUid);

    const updatedRecord = await this.prisma.eliminationRecord.update({
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
    const record = await this.prisma.eliminationRecord.findUniqueOrThrow({
      where: { uid },
      select: { tenantUid: true, residentUid: true },
    });

    checkPermission(currentUser, record.tenantUid);

    const updatedRecord = await this.prisma.eliminationRecord.update({
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
    const record = await this.prisma.eliminationRecord.findUniqueOrThrow({
      where: { uid },
      select: { tenantUid: true, residentUid: true },
    });

    checkPermission(currentUser, record.tenantUid);

    await this.prisma.eliminationRecord.update({
      where: { uid },
      data: {
        transcription: null,
      },
    });
  }

  async extract(
    uid: string,
    currentUser: User,
  ): Promise<EliminationRecordExtractedDto> {
    const record = await this.prisma.eliminationRecord.findUniqueOrThrow({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    checkPermission(currentUser, record.tenantUid);

    const currentState = await this.prisma.eliminationRecord.findUnique({
      where: { uid },
    });

    const extractedData = await extractData(
      record.transcription ?? '',
      currentState,
    );

    return plainToInstance(EliminationRecordExtractedDto, extractedData, {
      excludeExtraneousValues: true,
    });
  }
}
