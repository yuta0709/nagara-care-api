import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionAnswerDto {
  @ApiProperty({
    description: 'QAセッションID',
  })
  @IsUUID()
  qaSessionUid: string;

  @ApiProperty({
    description: '質問内容',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: '回答内容',
  })
  @IsString()
  answer: string;
}
