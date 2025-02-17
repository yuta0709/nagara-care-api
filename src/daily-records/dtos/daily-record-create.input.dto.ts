import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DailyStatus } from '@prisma/client';

export class DailyRecordCreateInputDto {
  @ApiProperty({ description: '記録時刻', example: '2024-03-20T12:00:00Z' })
  @IsOptional() // 未指定の場合は現在時刻が設定される
  recordedAt?: Date;

  @ApiProperty({ description: 'メモ', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: '日常の状態',
    enum: DailyStatus,
    required: false,
    example: 'NORMAL',
  })
  @IsEnum(DailyStatus)
  @IsOptional()
  dailyStatus?: DailyStatus;

  // 以下はコントローラーで設定
  residentUid?: string;
  tenantUid?: string;
  caregiverUid?: string;
}
