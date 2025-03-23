import { z } from 'zod';
import {
  CareLevel,
  IndependenceLevel,
  CognitiveIndependence,
} from '@prisma/client';

export const careLevelSchema = z
  .enum([
    'NEEDS_CARE_1',
    'NEEDS_CARE_2',
    'NEEDS_CARE_3',
    'NEEDS_CARE_4',
    'NEEDS_CARE_5',
  ])
  .describe('要介護状態区分');

export const independenceLevelSchema = z
  .enum(['INDEPENDENT', 'J1', 'J2', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  .describe('障害高齢者の日常生活自立度判定基準');

export const cognitiveIndependenceSchema = z
  .enum(['INDEPENDENT', 'I', 'IIa', 'IIb', 'IIIa', 'IIIb', 'IV', 'M'])
  .describe('認知症高齢者の日常生活自立度判定基準');

export const assessmentSchema = z.object({
  familyInfo: z.string().nullable().describe('家族構成'),

  careLevel: careLevelSchema.describe('要介護状態区分'),

  physicalIndependence:
    independenceLevelSchema.describe('障害高齢者の日常生活自立度判定基準'),

  cognitiveIndependence:
    cognitiveIndependenceSchema.describe(
      '認知症高齢者の日常生活自立度判定基準',
    ),

  medicalHistory: z.string().nullable().describe('既往症'),

  medications: z.string().nullable().describe('服用薬剤'),

  formalServices: z
    .string()
    .nullable()
    .describe('使用しているフォーマルサービス'),

  informalSupport: z
    .string()
    .nullable()
    .describe('使用しているインフォーマルサービス'),

  consultationBackground: z.string().nullable().describe('相談に至った経緯'),

  lifeHistory: z.string().nullable().describe('生活史'),

  complaints: z.string().nullable().describe('主訴'),

  healthNotes: z.string().nullable().describe('健康状態'),

  mentalStatus: z.string().nullable().describe('精神状態'),

  physicalStatus: z.string().nullable().describe('身体状態'),

  adlStatus: z.string().nullable().describe('ADL'),

  communication: z.string().nullable().describe('コミュニケーション'),

  dailyLife: z.string().nullable().describe('日常生活'),

  instrumentalADL: z.string().nullable().describe('IADL'),

  participation: z.string().nullable().describe('参加・参加制約'),

  environment: z.string().nullable().describe('環境'),

  livingSituation: z.string().nullable().describe('生活状況'),

  legalSupport: z.string().nullable().describe('制度的環境'),

  personalTraits: z.string().nullable().describe('個人因子'),
});
