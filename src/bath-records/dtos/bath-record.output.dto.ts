import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BathRecordDto {
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
  @ApiProperty({ description: '入浴方法' })
  bathMethod: string;
}
