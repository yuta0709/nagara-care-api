import { z } from 'zod';

export const beverageTypeSchema = z
  .enum(['WATER', 'TEA', 'OTHER'])
  .describe('飲み物の種類');

export const beverageRecordSchema = z.object({
  beverageType: beverageTypeSchema
    .nullable()
    .describe('飲み物の種類（水、お茶、その他）'),

  volume: z.number().nullable().describe('飲み物の摂取量（ml）'),

  notes: z.string().nullable().describe('特記事項'),
});
