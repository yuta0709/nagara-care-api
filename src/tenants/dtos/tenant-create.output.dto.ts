import { ApiProperty } from '@nestjs/swagger';

export class TenantCreateOutputDto {
  @ApiProperty({ description: 'テナントID' })
  uid: string;

  @ApiProperty({ description: 'テナント名' })
  name: string;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;
}
