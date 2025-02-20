import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  CareLevel,
  IndependenceLevel,
  CognitiveIndependence,
} from '@prisma/client';
import { SubjectDto } from '../../subjects/dtos/subject.output.dto';

export class AssessmentDto {
  @ApiProperty({ description: 'UID' })
  @Expose()
  uid: string;

  @ApiProperty({ description: 'アセスメント対象者UID' })
  @Expose()
  subjectUid: string;

  @ApiProperty({ description: 'アセスメント対象者' })
  @Expose()
  subject: SubjectDto;

  @ApiProperty({ description: 'テナントUID' })
  @Expose()
  tenantUid: string | null;

  @ApiProperty({ description: '記入者UID' })
  @Expose()
  userUid: string | null;

  @ApiProperty({ description: '家族構成' })
  @Expose()
  familyInfo: string | null;

  @ApiProperty({ description: '要介護状態区分', enum: CareLevel })
  @Expose()
  careLevel: CareLevel;

  @ApiProperty({
    description: '障害高齢者の日常生活自立度判定基準',
    enum: IndependenceLevel,
  })
  @Expose()
  physicalIndependence: IndependenceLevel;

  @ApiProperty({
    description: '認知症高齢者の日常生活自立度判定基準',
    enum: CognitiveIndependence,
  })
  @Expose()
  cognitiveIndependence: CognitiveIndependence;

  @ApiProperty({ description: '既往症' })
  @Expose()
  medicalHistory: string | null;

  @ApiProperty({ description: '服用薬剤' })
  @Expose()
  medications: string | null;

  @ApiProperty({ description: '使用しているフォーマルサービス' })
  @Expose()
  formalServices: string | null;

  @ApiProperty({ description: '使用しているインフォーマルサービス' })
  @Expose()
  informalSupport: string | null;

  @ApiProperty({ description: '相談に至った経緯' })
  @Expose()
  consultationBackground: string | null;

  @ApiProperty({ description: '生活史' })
  @Expose()
  lifeHistory: string | null;

  @ApiProperty({ description: '主訴' })
  @Expose()
  complaints: string | null;

  @ApiProperty({ description: '健康状態' })
  @Expose()
  healthNotes: string | null;

  @ApiProperty({ description: '精神状態' })
  @Expose()
  mentalStatus: string | null;

  @ApiProperty({ description: '身体状態' })
  @Expose()
  physicalStatus: string | null;

  @ApiProperty({ description: 'ADL' })
  @Expose()
  adlStatus: string | null;

  @ApiProperty({ description: 'コミュニケーション' })
  @Expose()
  communication: string | null;

  @ApiProperty({ description: '日常生活' })
  @Expose()
  dailyLife: string | null;

  @ApiProperty({ description: 'IADL' })
  @Expose()
  instrumentalADL: string | null;

  @ApiProperty({ description: '参加・参加制約' })
  @Expose()
  participation: string | null;

  @ApiProperty({ description: '環境' })
  @Expose()
  environment: string | null;

  @ApiProperty({ description: '生活状況' })
  @Expose()
  livingSituation: string | null;

  @ApiProperty({ description: '制度的環境' })
  @Expose()
  legalSupport: string | null;

  @ApiProperty({ description: '個人因子' })
  @Expose()
  personalTraits: string | null;

  @ApiProperty({ description: '作成日時' })
  @Expose()
  createdAt: Date;
}
