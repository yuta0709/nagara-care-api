import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TranscriptionInputDto {
  @ApiProperty({ description: '文字起こしテキスト' })
  @IsString()
  transcription: string;
}
