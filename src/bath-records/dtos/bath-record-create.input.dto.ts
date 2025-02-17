import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class BathRecordCreateInputDto {
  @ApiProperty({ description: '記録時刻', example: '2024-03-20T12:00:00Z' })
  @IsOptional() // 未指定の場合は現在時刻が設定される
  recordedAt?: Date;

  @ApiProperty({ description: 'メモ', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: '入浴方法',
    example: '一般浴',
  })
  @IsString()
  bathMethod: string;

  // 以下はコントローラーで設定
  residentUid?: string;
  tenantUid?: string;
  caregiverUid?: string;
}
