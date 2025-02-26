import { z } from 'zod';

export const beverageTypeSchema = z
  .enum(['WATER', 'TEA', 'OTHER'])
  .describe('飲み物の種類');

export const foodRecordSchema = z.object({
  mainCoursePercentage: z
    .number()
    .min(0)
    .max(100)
    .nullable()
    .describe('主食の摂取率（%）'),

  sideDishPercentage: z
    .number()
    .min(0)
    .max(100)
    .nullable()
    .describe('副食の摂取率（%）'),

  soupPercentage: z
    .number()
    .min(0)
    .max(100)
    .nullable()
    .describe('汁物の摂取率（%）'),

  beverageType: beverageTypeSchema
    .nullable()
    .describe('飲み物の種類（水、お茶、その他）'),

  beverageVolume: z.number().min(0).nullable().describe('飲み物の摂取量（ml）'),

  notes: z.string().nullable().describe('特記事項'),
});
