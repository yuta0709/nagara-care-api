import { ApiProperty } from '@nestjs/swagger';
import { DailyStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class DailyRecordExtractedDto {
  @ApiProperty()
  @Expose()
  notes: string | null;

  @ApiProperty()
  @Expose()
  dailyStatus: DailyStatus | null;
}
