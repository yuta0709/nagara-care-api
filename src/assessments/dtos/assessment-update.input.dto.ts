import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import {
  CareLevel,
  IndependenceLevel,
  CognitiveIndependence,
} from '@prisma/client';

export class AssessmentUpdateInputDto {
  @ApiProperty({ description: '家族構成', required: false })
  @IsString()
  @IsOptional()
  familyInfo?: string;

  @ApiProperty({
    description: '要介護状態区分',
    enum: CareLevel,
    required: false,
  })
  @IsEnum(CareLevel)
  @IsOptional()
  careLevel?: CareLevel;

  @ApiProperty({
    description: '障害高齢者の日常生活自立度判定基準',
    enum: IndependenceLevel,
    required: false,
  })
  @IsEnum(IndependenceLevel)
  @IsOptional()
  physicalIndependence?: IndependenceLevel;

  @ApiProperty({
    description: '認知症高齢者の日常生活自立度判定基準',
    enum: CognitiveIndependence,
    required: false,
  })
  @IsEnum(CognitiveIndependence)
  @IsOptional()
  cognitiveIndependence?: CognitiveIndependence;

  @ApiProperty({ description: '既往症', required: false })
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiProperty({ description: '服用薬剤', required: false })
  @IsString()
  @IsOptional()
  medications?: string;

  @ApiProperty({
    description: '使用しているフォーマルサービス',
    required: false,
  })
  @IsString()
  @IsOptional()
  formalServices?: string;

  @ApiProperty({
    description: '使用しているインフォーマルサービス',
    required: false,
  })
  @IsString()
  @IsOptional()
  informalSupport?: string;

  @ApiProperty({ description: '相談に至った経緯', required: false })
  @IsString()
  @IsOptional()
  consultationBackground?: string;

  @ApiProperty({ description: '生活史', required: false })
  @IsString()
  @IsOptional()
  lifeHistory?: string;

  @ApiProperty({ description: '主訴', required: false })
  @IsString()
  @IsOptional()
  complaints?: string;

  @ApiProperty({ description: '健康状態', required: false })
  @IsString()
  @IsOptional()
  healthNotes?: string;

  @ApiProperty({ description: '精神状態', required: false })
  @IsString()
  @IsOptional()
  mentalStatus?: string;

  @ApiProperty({ description: '身体状態', required: false })
  @IsString()
  @IsOptional()
  physicalStatus?: string;

  @ApiProperty({ description: 'ADL', required: false })
  @IsString()
  @IsOptional()
  adlStatus?: string;

  @ApiProperty({ description: 'コミュニケーション', required: false })
  @IsString()
  @IsOptional()
  communication?: string;

  @ApiProperty({ description: '日常生活', required: false })
  @IsString()
  @IsOptional()
  dailyLife?: string;

  @ApiProperty({ description: 'IADL', required: false })
  @IsString()
  @IsOptional()
  instrumentalADL?: string;

  @ApiProperty({ description: '参加・参加制約', required: false })
  @IsString()
  @IsOptional()
  participation?: string;

  @ApiProperty({ description: '環境', required: false })
  @IsString()
  @IsOptional()
  environment?: string;

  @ApiProperty({ description: '生活状況', required: false })
  @IsString()
  @IsOptional()
  livingSituation?: string;

  @ApiProperty({ description: '制度的環境', required: false })
  @IsString()
  @IsOptional()
  legalSupport?: string;

  @ApiProperty({ description: '個人因子', required: false })
  @IsString()
  @IsOptional()
  personalTraits?: string;
}
