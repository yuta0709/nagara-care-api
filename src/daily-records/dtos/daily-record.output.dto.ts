import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DailyStatus } from '@prisma/client';

export class DailyRecordDto {
  @Expose()
  @ApiProperty({ description: 'UID' })
  uid: string;

  @Expose()
  @ApiProperty({ description: 'テナントUID' })
  tenantUid: string;

  @Expose()
  @ApiProperty({ description: '介護者UID' })
  caregiverUid: string;

  @Expose()
  @ApiProperty({ description: '利用者UID' })
  residentUid: string;

  @Expose()
  @ApiProperty({ description: '記録時刻' })
  recordedAt: Date;

  @Expose()
  @ApiProperty({ description: 'メモ' })
  notes?: string;

  @Expose()
  @ApiProperty({ description: '日常の状態', enum: DailyStatus })
  dailyStatus?: DailyStatus;
}
