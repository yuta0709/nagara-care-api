import { ApiProperty } from '@nestjs/swagger';
import { BeverageRecordDto } from './beverage-record.output.dto';

export class BeverageRecordListResponseDto {
  @ApiProperty({ type: [BeverageRecordDto] })
  items: BeverageRecordDto[];

  @ApiProperty({ description: '総件数' })
  total: number;
}
