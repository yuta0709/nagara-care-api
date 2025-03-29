import { z } from 'zod';


export const EliminationSchema = z.object({
  eiminationMethod: z.string().nullable().describe('排泄方法'),

  hasFeces: z.boolean().nullable().describe('便の有無'),

  fecalIncontinence: z.boolean().nullable().describe('便失禁の有無'),

  fecesAppearance: z.string().nullable().describe('便の性状'),

  fecesVolume: z.number().nullable().describe('便の量（g）'),

  hasUrine: z.boolean().nullable().describe('尿の有無'),

  urinaryIncontinence: z.boolean().nullable().describe('尿失禁の有無'),

  urineAppearance: z.string().nullable().describe('尿の性状'),

  urineVolume: z.number().nullable().describe('尿量（ml）'),


  notes: z.string().nullable().describe('備考'),
});
