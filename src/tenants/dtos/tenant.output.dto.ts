import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TenantDto {
  @ApiProperty({ description: 'テナントUID' })
  @Expose()
  uid: string;

  @ApiProperty({ description: 'テナント名' })
  @Expose()
  name: string;

  @ApiProperty({ description: '作成日時' })
  @Expose()
  createdAt: Date;
}
