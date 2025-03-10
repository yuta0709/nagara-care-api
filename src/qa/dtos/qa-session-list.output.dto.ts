import { ApiProperty } from '@nestjs/swagger';
import { QaSessionOutputDto } from './qa-session.output.dto';
import { Expose } from 'class-transformer';

export class QaSessionListOutputDto {
  @ApiProperty({ type: [QaSessionOutputDto] })
  @Expose()
  items: QaSessionOutputDto[];

  @ApiProperty({ description: '総数' })
  @Expose()
  total: number;
}
