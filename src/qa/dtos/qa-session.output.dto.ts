import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { QuestionAnswerOutputDto } from './question-answer.output.dto';

export class QaSessionOutputDto {
  @ApiProperty({ description: 'QAセッションUID' })
  @Expose()
  uid: string;

  @ApiProperty({ description: 'ユーザーUID' })
  @Expose()
  userUid: string;

  @ApiProperty({
    description: '質問回答',
    type: [QuestionAnswerOutputDto],
  })
  @Expose()
  questionAnswers: QuestionAnswerOutputDto[];

  @ApiProperty({ description: '作成日時' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: '文字起こし' })
  @Expose()
  transcription: string;
}
