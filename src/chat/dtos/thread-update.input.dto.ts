import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ThreadUpdateInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
