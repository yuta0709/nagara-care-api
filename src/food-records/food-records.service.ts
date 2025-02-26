import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FoodRecordCreateInputDto } from './dtos/food-record-create.input.dto';
import { FoodRecordUpdateInputDto } from './dtos/food-record-update.input.dto';
import { User, UserRole, MealTime } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { FoodRecordDto } from './dtos/food-record.output.dto';
import { FoodRecordListResponseDto } from './dtos/food-record-list.output.dto';
import {
  DailyFoodRecordsDto,
  DailyFoodRecordsListResponseDto,
} from './dtos/food-record-daily.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { extractData } from './llm/extractor';
import { FoodRecordExtractedDto } from './dtos/food-record-extracted.output.dto';

@Injectable()
export class FoodRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByResident(
    residentUid: string,
    currentUser: User,
  ): Promise<FoodRecordListResponseDto> {
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
      this.prisma.foodRecord.findMany({
        where: { residentUid },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.foodRecord.count({
        where: { residentUid },
      }),
    ]);

    return {
      items: plainToInstance(FoodRecordDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async create(
    input: FoodRecordCreateInputDto,
    currentUser: User,
  ): Promise<FoodRecordDto> {
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

    // 同じ利用者の同じ食事時間帯の記録が既に存在するか確認
    const existingRecord = await this.prisma.foodRecord.findFirst({
      where: {
        residentUid: input.residentUid,
        mealTime: input.mealTime,
        // 同じ日付の記録を検索するために日付の範囲を設定
        recordedAt: {
          gte: new Date(
            new Date(input.recordedAt ?? new Date()).setHours(0, 0, 0, 0),
          ),
          lt: new Date(
            new Date(input.recordedAt ?? new Date()).setHours(23, 59, 59, 999),
          ),
        },
      },
    });

    // 既存の記録がある場合は更新
    if (existingRecord) {
      // CAREGIVERは自身が作成した記録のみ更新可能
      if (
        currentUser.role === UserRole.CAREGIVER &&
        existingRecord.caregiverUid !== currentUser.uid
      ) {
        throw new UnauthorizedException(
          '他の介護者の記録を更新する権限がありません',
        );
      }

      const updatedRecord = await this.prisma.foodRecord.update({
        where: { uid: existingRecord.uid },
        data: {
          recordedAt: input.recordedAt ?? new Date(),
          notes: input.notes,
          mainCoursePercentage: input.mainCoursePercentage,
          sideDishPercentage: input.sideDishPercentage,
          soupPercentage: input.soupPercentage,
          beverageType: input.beverageType,
          beverageVolume: input.beverageVolume,
          caregiverUid: currentUser.uid, // 更新者を現在のユーザーに変更
        },
      });

      return plainToInstance(FoodRecordDto, updatedRecord, {
        excludeExtraneousValues: true,
      });
    }

    // 既存の記録がない場合は新規作成
    const record = await this.prisma.foodRecord.create({
      data: {
        recordedAt: input.recordedAt ?? new Date(),
        notes: input.notes,
        mealTime: input.mealTime,
        mainCoursePercentage: input.mainCoursePercentage,
        sideDishPercentage: input.sideDishPercentage,
        soupPercentage: input.soupPercentage,
        beverageType: input.beverageType,
        beverageVolume: input.beverageVolume,
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

    return plainToInstance(FoodRecordDto, record, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    input: FoodRecordUpdateInputDto,
    currentUser: User,
  ): Promise<FoodRecordDto> {
    const record = await this.prisma.foodRecord.findUnique({
      where: { uid },
    });
    if (!record) {
      throw new NotFoundException(`Food record with uid ${uid} not found`);
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

    const updatedRecord = await this.prisma.foodRecord.update({
      where: { uid },
      data: input,
    });

    return plainToInstance(FoodRecordDto, updatedRecord, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const record = await this.prisma.foodRecord.findUnique({
      where: { uid },
    });
    if (!record) {
      throw new NotFoundException(`Food record with uid ${uid} not found`);
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

    await this.prisma.foodRecord.delete({ where: { uid } });
  }

  async findDailyRecordsByResident(
    residentUid: string,
    currentUser: User,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DailyFoodRecordsListResponseDto> {
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

    // 日付範囲の設定（デフォルトは過去30日間）
    const now = new Date();
    const end = endDate ? new Date(endDate) : new Date(now);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const start = startDate ? new Date(startDate) : thirtyDaysAgo;

    // 指定期間内の全ての食事記録を取得
    const foodRecords = await this.prisma.foodRecord.findMany({
      where: {
        residentUid,
        recordedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { recordedAt: 'desc' },
    });

    // 日付ごとにグループ化
    const recordsByDate = new Map<string, FoodRecordDto[]>();

    foodRecords.forEach((record) => {
      const date = new Date(record.recordedAt).toISOString().split('T')[0]; // YYYY-MM-DD形式
      if (!recordsByDate.has(date)) {
        recordsByDate.set(date, []);
      }
      recordsByDate.get(date).push(
        plainToInstance(FoodRecordDto, record, {
          excludeExtraneousValues: true,
        }),
      );
    });

    // 日付ごとに朝食・昼食・夕食に分類
    const dailyRecords: DailyFoodRecordsDto[] = [];

    recordsByDate.forEach((records, date) => {
      const dailyRecord: DailyFoodRecordsDto = {
        date,
        breakfast: records.find((r) => r.mealTime === MealTime.BREAKFAST),
        lunch: records.find((r) => r.mealTime === MealTime.LUNCH),
        dinner: records.find((r) => r.mealTime === MealTime.DINNER),
      };

      dailyRecords.push(dailyRecord);
    });

    // 日付の降順でソート
    dailyRecords.sort((a, b) => b.date.localeCompare(a.date));

    return {
      items: dailyRecords,
      total: dailyRecords.length,
    };
  }

  // 文字起こし関連のメソッド
  async getTranscription(
    uid: string,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const record = await this.prisma.foodRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`食事記録が見つかりません（UID: ${uid}）`);
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
    const record = await this.prisma.foodRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`食事記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

    const updatedRecord = await this.prisma.foodRecord.update({
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
    const record = await this.prisma.foodRecord.findUnique({
      where: { uid },
      select: { tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`食事記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

    const updatedRecord = await this.prisma.foodRecord.update({
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
    const record = await this.prisma.foodRecord.findUnique({
      where: { uid },
      select: { tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`食事記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

    await this.prisma.foodRecord.update({
      where: { uid },
      data: {
        transcription: null,
      },
    });
  }

  async extract(
    uid: string,
    currentUser: User,
  ): Promise<FoodRecordExtractedDto> {
    const record = await this.prisma.foodRecord.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true, residentUid: true },
    });

    if (!record) {
      throw new NotFoundException(`食事記録が見つかりません（UID: ${uid}）`);
    }

    // 権限チェック
    await this.checkPermission(
      record.tenantUid,
      record.residentUid,
      currentUser,
    );

    const extractedData = await extractData(record.transcription ?? '');

    return plainToInstance(FoodRecordExtractedDto, extractedData, {
      excludeExtraneousValues: true,
    });
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
