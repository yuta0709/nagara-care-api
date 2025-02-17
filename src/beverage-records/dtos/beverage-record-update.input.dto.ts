import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BeverageType } from '@prisma/client';

export class BeverageRecordUpdateInputDto {
  @ApiProperty({ description: '記録時刻', example: '2024-03-20T12:00:00Z' })
  @IsOptional()
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
  @IsOptional()
  beverageType?: BeverageType;

  @ApiProperty({
    description: '飲み物の量（ml）',
    minimum: 0,
    example: 200,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  volume?: number;
}
