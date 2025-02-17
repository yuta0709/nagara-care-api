import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class TenantUpdateInputDto {
  @ApiProperty({ description: 'テナント名', example: '介護施設A' })
  @IsString()
  @Length(1, 100)
  @IsOptional()
  name?: string;
}
