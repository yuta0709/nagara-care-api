import { ApiProperty } from '@nestjs/swagger';
import { BathRecordDto } from './bath-record.output.dto';
import { Expose } from 'class-transformer';

export class BathRecordListResponseDto {
  @Expose()
  @ApiProperty({ type: [BathRecordDto] })
  items: BathRecordDto[];

  @Expose()
  @ApiProperty({ description: '総件数' })
  total: number;
}
