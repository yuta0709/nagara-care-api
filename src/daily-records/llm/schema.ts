import { z } from 'zod';

export const dailyRecordSchema = z.object({
  notes: z.string().nullable().describe('特記事項'),

  dailyStatus: z
    .enum(['NORMAL', 'WARNING', 'ALERT'])
    .describe('日常の状態（普通、注意、警告）'),
});
