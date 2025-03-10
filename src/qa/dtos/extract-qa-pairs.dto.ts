import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExtractQaPairsDto {
  @ApiProperty({
    description: '文字起こしテキスト',
  })
  @IsString()
  transcript: string;
}
