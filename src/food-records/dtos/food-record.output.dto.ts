import { ApiProperty } from '@nestjs/swagger';
import { MealTime, BeverageType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class FoodRecordDto {
  @Expose()
  @ApiProperty({ description: 'UID' })
  uid: string;

  @Expose()
  @ApiProperty({ description: 'テナントUID' })
  tenantUid: string;

  @Expose()
  @ApiProperty({ description: '介護者UID' })
  caregiverUid: string;

  @Expose()
  @ApiProperty({ description: '利用者UID' })
  residentUid: string;

  @Expose()
  @ApiProperty({ description: '記録時刻' })
  recordedAt: Date;

  @Expose()
  @ApiProperty({ description: 'メモ' })
  notes?: string;

  @Expose()
  @ApiProperty({ description: '食事の時間帯', enum: MealTime })
  mealTime: MealTime;

  @Expose()
  @ApiProperty({ description: '主食の摂取率（%）' })
  mainCoursePercentage: number;

  @Expose()
  @ApiProperty({ description: '副食の摂取率（%）' })
  sideDishPercentage: number;

  @Expose()
  @ApiProperty({ description: '汁物の摂取率（%）' })
  soupPercentage: number;

  @Expose()
  @ApiProperty({ description: '飲み物の種類', enum: BeverageType })
  beverageType: BeverageType;

  @Expose()
  @ApiProperty({ description: '飲み物の摂取量（ml）' })
  beverageVolume: number;
}
