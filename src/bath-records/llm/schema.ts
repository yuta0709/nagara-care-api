import { z } from 'zod';

export const bathRecordSchema = z.object({
  bathMethod: z
    .string()
    .nullable()
    .describe('入浴方法（一般浴、機械浴、シャワー浴など）'),

  notes: z.string().nullable().describe('特記事項'),
});
