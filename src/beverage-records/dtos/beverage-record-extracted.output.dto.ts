import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BeverageType } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class BeverageRecordExtractedDto {
  @Expose()
  @IsOptional()
  @ApiProperty({
    description: '飲み物の種類',
    enum: BeverageType,
  })
  beverageType: BeverageType;

  @Expose()
  @IsOptional()
  @ApiProperty({
    description: '飲み物の量（ml）',
  })
  volume: number;

  @Expose()
  @IsOptional()
  @ApiProperty({
    description: '特記事項',
  })
  notes?: string;
}
