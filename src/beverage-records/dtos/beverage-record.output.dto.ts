import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BeverageType } from '@prisma/client';

export class BeverageRecordDto {
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
  @ApiProperty({ description: '飲み物の種類', enum: BeverageType })
  beverageType: BeverageType;

  @Expose()
  @ApiProperty({ description: '飲み物の量（ml）' })
  volume: number;
}
