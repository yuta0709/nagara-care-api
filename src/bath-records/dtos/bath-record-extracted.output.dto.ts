import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class BathRecordExtractedDto {
  @Expose()
  @IsOptional()
  @ApiProperty({
    description: '入浴方法',
  })
  bathMethod: string;

  @Expose()
  @IsOptional()
  @ApiProperty({
    description: '特記事項',
  })
  notes?: string;
}
