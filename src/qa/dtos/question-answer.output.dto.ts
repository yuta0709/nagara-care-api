import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class QuestionAnswerOutputDto {
  @ApiProperty({ description: '質問回答UID' })
  @Expose()
  uid: string;

  @ApiProperty({ description: '質問' })
  @Expose()
  question: string;

  @ApiProperty({ description: '回答' })
  @Expose()
  answer: string;

  @ApiProperty({ description: '作成日時' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  @Expose()
  updatedAt: Date;
}
