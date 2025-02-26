import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { FoodRecordDto } from './food-record.output.dto';

export class DailyFoodRecordsDto {
  @ApiProperty({ description: '日付', example: '2024-03-20' })
  @Expose()
  date: string;

  @ApiProperty({
    description: '朝食の記録',
    type: FoodRecordDto,
    required: false,
  })
  @Expose()
  @Type(() => FoodRecordDto)
  breakfast?: FoodRecordDto;

  @ApiProperty({
    description: '昼食の記録',
    type: FoodRecordDto,
    required: false,
  })
  @Expose()
  @Type(() => FoodRecordDto)
  lunch?: FoodRecordDto;

  @ApiProperty({
    description: '夕食の記録',
    type: FoodRecordDto,
    required: false,
  })
  @Expose()
  @Type(() => FoodRecordDto)
  dinner?: FoodRecordDto;
}

export class DailyFoodRecordsListResponseDto {
  @ApiProperty({ description: '日別食事記録一覧', type: [DailyFoodRecordsDto] })
  @Expose()
  @Type(() => DailyFoodRecordsDto)
  items: DailyFoodRecordsDto[];

  @ApiProperty({ description: '総日数', example: 10 })
  @Expose()
  total: number;
}
