import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { FoodRecordDto } from './food-record.output.dto';

export class FoodRecordListResponseDto {
  @Expose()
  @ApiProperty({ type: [FoodRecordDto] })
  items: FoodRecordDto[];

  @Expose()
  @ApiProperty({ description: '総件数' })
  total: number;
}
