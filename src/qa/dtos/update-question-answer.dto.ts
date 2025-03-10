import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuestionAnswerDto {
  @ApiProperty({
    description: '質問回答ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  uid: string;

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
