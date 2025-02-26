import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TranscriptionDto {
  @ApiProperty({ description: '文字起こしテキスト' })
  @Expose()
  transcription: string | null;
}
