import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EliminationRecordDto {
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
  @ApiProperty({ description: '排泄方法' })
  eliminationMethod: string;

  @Expose()
  @ApiProperty({ description: '便の有無' })
  hasFeces: boolean;

  @Expose()
  @ApiProperty({ description: '便失禁の有無' })
  fecalIncontinence?: boolean;

  @Expose()
  @ApiProperty({ description: '便の性状' })
  fecesAppearance?: string;

  @Expose()
  @ApiProperty({ description: '便の量（g）' })
  fecesVolume?: number;

  @Expose()
  @ApiProperty({ description: '尿の有無' })
  hasUrine: boolean;

  @Expose()
  @ApiProperty({ description: '尿失禁の有無' })
  urinaryIncontinence?: boolean;

  @Expose()
  @ApiProperty({ description: '尿の性状' })
  urineAppearance?: string;

  @Expose()
  @ApiProperty({ description: '尿量（ml）' })
  urineVolume?: number;
}
