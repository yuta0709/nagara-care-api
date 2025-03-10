import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQaSessionDto {
  @ApiProperty({
    description: 'タイトル',
  })
  @IsString()
  title: string;
}
