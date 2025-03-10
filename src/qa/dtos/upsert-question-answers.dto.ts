import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class QuestionAnswerItem {
  @ApiProperty({
    description: '質問内容',
    example: '今日の体調はいかがですか？',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: '回答内容',
    example: '調子が良いです。',
  })
  @IsString()
  answer: string;
}

export class UpsertQuestionAnswersDto {
  @ApiProperty({
    description: '質問と回答のリスト',
    type: [QuestionAnswerItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  questionAnswers: QuestionAnswerItem[];
}
