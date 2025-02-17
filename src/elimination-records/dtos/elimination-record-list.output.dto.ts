import { ApiProperty } from '@nestjs/swagger';
import { EliminationRecordDto } from './elimination-record.output.dto';

export class EliminationRecordListResponseDto {
  @ApiProperty({ type: [EliminationRecordDto] })
  items: EliminationRecordDto[];

  @ApiProperty({ description: '総件数' })
  total: number;
}
