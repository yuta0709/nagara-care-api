import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BeverageType } from '@prisma/client';

export class BeverageRecordCreateInputDto {
  @ApiProperty({ description: '記録時刻', example: '2024-03-20T12:00:00Z' })
  @IsOptional() // 未指定の場合は現在時刻が設定される
  recordedAt?: Date;

  @ApiProperty({ description: 'メモ', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: '飲み物の種類',
    enum: BeverageType,
    example: BeverageType.WATER,
  })
  @IsEnum(BeverageType)
  beverageType: BeverageType;

  @ApiProperty({
    description: '飲み物の量（ml）',
    minimum: 0,
    example: 200,
  })
  @IsInt()
  @Min(0)
  volume: number;

  // 以下はコントローラーで設定
  residentUid?: string;
  tenantUid?: string;
  caregiverUid?: string;
}
