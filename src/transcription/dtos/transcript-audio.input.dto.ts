import { ApiProperty } from '@nestjs/swagger';
import { type Express } from 'express';

export class TranscriptAudioInputDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  audio: Express.Multer.File;
}
