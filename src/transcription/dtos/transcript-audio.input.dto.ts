import { ApiProperty } from '@nestjs/swagger';

export class TranscriptAudioInputDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  audio: Express.Multer.File;
}
