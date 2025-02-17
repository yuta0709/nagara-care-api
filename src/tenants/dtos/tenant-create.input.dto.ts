import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TenantCreateInputDto {
  @ApiProperty({
    description: 'テナント名',
    example: '介護施設A',
  })
  @IsString()
  @MinLength(1)
  name: string;
}
