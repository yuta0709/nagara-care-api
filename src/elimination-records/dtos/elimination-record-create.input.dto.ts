import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class EliminationRecordCreateInputDto {
  @ApiProperty({ description: '記録時刻', example: '2024-03-20T12:00:00Z' })
  @IsOptional() // 未指定の場合は現在時刻が設定される
  recordedAt?: Date;

  @ApiProperty({ description: 'メモ', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: '排泄方法',
    example: 'トイレ',
  })
  @IsString()
  eliminationMethod: string;

  @ApiProperty({
    description: '便の有無',
    example: true,
  })
  @IsBoolean()
  hasFeces: boolean;

  @ApiProperty({
    description: '便失禁の有無',
    required: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  fecalIncontinence?: boolean;

  @ApiProperty({
    description: '便の性状',
    required: false,
    example: '普通便',
  })
  @IsString()
  @IsOptional()
  fecesAppearance?: string;

  @ApiProperty({
    description: '便の量（g）',
    required: false,
    minimum: 0,
    example: 100,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  fecesVolume?: number;

  @ApiProperty({
    description: '尿の有無',
    example: true,
  })
  @IsBoolean()
  hasUrine: boolean;

  @ApiProperty({
    description: '尿失禁の有無',
    required: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  urinaryIncontinence?: boolean;

  @ApiProperty({
    description: '尿の性状',
    required: false,
    example: '普通',
  })
  @IsString()
  @IsOptional()
  urineAppearance?: string;

  @ApiProperty({
    description: '尿量（ml）',
    required: false,
    minimum: 0,
    example: 200,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  urineVolume?: number;

  // 以下はコントローラーで設定
  residentUid?: string;
  tenantUid?: string;
  caregiverUid?: string;
}
