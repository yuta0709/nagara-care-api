import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DailyStatus } from '@prisma/client';

export class DailyRecordUpdateInputDto {
  @ApiProperty({ description: '記録時刻', example: '2024-03-20T12:00:00Z' })
  @IsOptional()
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
}
