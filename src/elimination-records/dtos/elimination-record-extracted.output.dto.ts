import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class EliminationRecordExtractedDto {
  @ApiProperty({ description: '排泄方法' })
  @Expose()
  @IsOptional()
  eliminationMethod: string;


  @ApiProperty({ description: '便の有無' })
  @Expose()
  @IsOptional()
  hasFeces: boolean;

  @ApiProperty({ description: '便失禁の有無' })
  @Expose()
  @IsOptional()
  fecalIncontinence?: boolean;

  @ApiProperty({ description: '便の性状' })
  @Expose()
  @IsOptional()
  fecesAppearance?: string;

  @ApiProperty({ description: '便の量（g）' })
  @Expose()
  @IsOptional()
  fecesVolume?: number;

  @ApiProperty({ description: '尿の有無' })
  @Expose()
  @IsOptional()
  hasUrine: boolean;

  @ApiProperty({ description: '尿失禁の有無' })
  @Expose()
  @IsOptional()
  urinaryIncontinence?: boolean;

  @ApiProperty({ description: '尿の性状' })
  @Expose()
  @IsOptional()
  urineAppearance?: string;

  @ApiProperty({ description: '尿量（ml）' })
  @Expose()
  @IsOptional()
  urineVolume?: number;

  @ApiProperty({ description: '備考' })
  @Expose()
  @IsOptional()
  notes?: string;
}
