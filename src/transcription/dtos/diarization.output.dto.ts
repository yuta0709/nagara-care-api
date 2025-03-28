import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

class Word {
  @ApiProperty()
  @Expose()
  speaker_id: string | null;

  @ApiProperty()
  @Expose()
  text: string;
}

export class DiarizationOutputDto {
  @ApiProperty({ type: [Word] })
  @Expose()
  words: Word[];
}
