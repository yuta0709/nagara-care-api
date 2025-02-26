import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FoodRecordExtractedDto {
  @ApiProperty({ description: '主食の摂取率（0-100%）' })
  @Expose()
  @IsOptional()
  mainCoursePercentage: number;

  @ApiProperty({ description: '副食の摂取率（0-100%）' })
  @Expose()
  @IsOptional()
  sideDishPercentage: number;

  @ApiProperty({ description: '汁物の摂取率（0-100%）' })
  @Expose()
  @IsOptional()
  soupPercentage: number;

  @ApiProperty({ description: '飲み物の種類（水、お茶、その他）' })
  @Expose()
  @IsOptional()
  beverageType: string;

  @ApiProperty({ description: '飲み物の摂取量（ml）' })
  @Expose()
  @IsOptional()
  beverageVolume: number;

  @ApiProperty({ description: '特記事項' })
  @Expose()
  @IsOptional()
  notes: string;
}
