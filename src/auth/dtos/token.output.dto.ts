import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenDto {
  @Expose()
  @ApiProperty({ description: 'JWTトークン' })
  token: string;
}
