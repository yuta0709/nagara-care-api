import { z } from 'zod';

export const beverageTypeSchema = z
  .enum(['WATER', 'TEA', 'OTHER'])
  .describe('飲み物の種類');

export const foodRecordSchema = z.object({
  mainCoursePercentage: z.number().nullable().describe('主食の摂取率（%）'),

  sideDishPercentage: z.number().nullable().describe('副食の摂取率（%）'),

  soupPercentage: z.number().nullable().describe('汁物の摂取率（%）'),

  beverageType: beverageTypeSchema
    .nullable()
    .describe('飲み物の種類（水、お茶、その他）'),

  beverageVolume: z.number().nullable().describe('飲み物の摂取量（ml）'),

  notes: z.string().nullable().describe('特記事項'),
});
