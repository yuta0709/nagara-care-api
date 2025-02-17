import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { MealTime, BeverageType } from '@prisma/client';

export class FoodRecordUpdateInputDto {
  @ApiProperty({ description: '記録時刻', example: '2024-03-20T12:00:00Z' })
  @IsOptional()
  recordedAt?: Date;

  @ApiProperty({ description: 'メモ', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: '食事の時間帯',
    enum: MealTime,
    example: MealTime.LUNCH,
  })
  @IsEnum(MealTime)
  @IsOptional()
  mealTime?: MealTime;

  @ApiProperty({
    description: '主食の摂取率（%）',
    minimum: 0,
    maximum: 100,
    example: 80,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  mainCoursePercentage?: number;

  @ApiProperty({
    description: '副食の摂取率（%）',
    minimum: 0,
    maximum: 100,
    example: 70,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  sideDishPercentage?: number;

  @ApiProperty({
    description: '汁物の摂取率（%）',
    minimum: 0,
    maximum: 100,
    example: 90,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  soupPercentage?: number;

  @ApiProperty({
    description: '飲み物の種類',
    enum: BeverageType,
    example: BeverageType.WATER,
  })
  @IsEnum(BeverageType)
  @IsOptional()
  beverageType?: BeverageType;

  @ApiProperty({
    description: '飲み物の摂取量（ml）',
    minimum: 0,
    example: 200,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  beverageVolume?: number;
}
