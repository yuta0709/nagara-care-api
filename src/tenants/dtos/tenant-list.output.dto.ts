import { ApiProperty } from '@nestjs/swagger';

export class TenantListItemDto {
  @ApiProperty({ description: 'テナントUID' })
  uid: string;

  @ApiProperty({ description: 'テナント名' })
  name: string;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;
}

export class TenantListResponseDto {
  @ApiProperty({ description: 'テナント一覧', type: [TenantListItemDto] })
  items: TenantListItemDto[];

  @ApiProperty({ description: '総件数' })
  total: number;
}
