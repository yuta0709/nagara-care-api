import { ApiProperty } from '@nestjs/swagger';
import { DailyRecordDto } from './daily-record.output.dto';

export class DailyRecordListResponseDto {
  @ApiProperty({ type: [DailyRecordDto] })
  items: DailyRecordDto[];

  @ApiProperty({ description: '総件数' })
  total: number;
}
