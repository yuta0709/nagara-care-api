import {
  Injectable,
  NotFoundException,
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

@Injectable()
export class EliminationRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByResident(
    residentUid: string,
    currentUser: User,
  ): Promise<EliminationRecordListResponseDto> {
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
    const record = await this.prisma.eliminationRecord.findUnique({
      where: { uid },
    });
    if (!record) {
      throw new NotFoundException(
        `Elimination record with uid ${uid} not found`,
      );
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

    const updatedRecord = await this.prisma.eliminationRecord.update({
      where: { uid },
      data: input,
    });

    return plainToInstance(EliminationRecordDto, updatedRecord, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const record = await this.prisma.eliminationRecord.findUnique({
      where: { uid },
    });
    if (!record) {
      throw new NotFoundException(
        `Elimination record with uid ${uid} not found`,
      );
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

    await this.prisma.eliminationRecord.delete({ where: { uid } });
  }

  // 文字起こし関連のメソッド
  async getTranscription(
    uid: string,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.eliminationRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`排泄記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

    return plainToInstance(TranscriptionDto, record, {
      excludeExtraneousValues: true,
    });
  }

  async appendTranscription(
    uid: string,
    input: TranscriptionInputDto,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.eliminationRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`排泄記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

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
    const record = await this.prisma.eliminationRecord.findUnique({
      where: { uid },
      select: { tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`排泄記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

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
    const record = await this.prisma.eliminationRecord.findUnique({
      where: { uid },
      select: { tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`排泄記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

    await this.prisma.eliminationRecord.update({
      where: { uid },
      data: {
        transcription: null,
      },
    });
  }

  async extract(uid: string, currentUser: User): Promise<string> {
    const record = await this.prisma.eliminationRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`排泄記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

    if (!record.transcription) {
      return '';
    }

    // 将来的にLLMによる情報抽出を実装予定
    // 現時点では空文字列を返す
    return '';
  }

  // 権限チェック用のヘルパーメソッド
  private async checkPermission(
    tenantUid: string | null,
    residentUid: string | null,
    currentUser: User,
  ): Promise<void> {
    // GLOBAL_ADMINはすべての記録にアクセス可能
    if (currentUser.role === UserRole.GLOBAL_ADMIN) {
      return;
    }

    // TENANT_ADMINとCAREGIVERは自身のテナントの記録のみアクセス可能
    if (tenantUid !== currentUser.tenantUid) {
      throw new UnauthorizedException(
        '他のテナントの記録にアクセスする権限がありません',
      );
    }
  }
}
