import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TranscriptionInputDto {
  @ApiProperty()
  @IsString()
  transcription: string;
}
