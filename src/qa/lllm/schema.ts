import { z } from 'zod';

export const questionAnswerSchema = z.object({
  question: z.string().describe('質問内容'),
  answer: z.string().nullable().describe('回答内容'),
});

export const questionAnswerResponseSchema = z.object({
  data: z.array(questionAnswerSchema).describe('質問と回答の組の配列'),
});
