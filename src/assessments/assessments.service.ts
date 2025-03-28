import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssessmentCreateInputDto } from './dtos/assessment-create.input.dto';
import { AssessmentUpdateInputDto } from './dtos/assessment-update.input.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import {
  User,
  CareLevel,
  IndependenceLevel,
  CognitiveIndependence,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { AssessmentDto } from './dtos/assessment.output.dto';
import { AssessmentListResponseDto } from './dtos/assessment-list.output.dto';
import { summarize } from './llm/summarize';
import { extractData } from './llm/extractor';
import { checkPermission } from 'src/common/permission';

@Injectable()
export class AssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: AssessmentCreateInputDto,
    currentUser: User,
  ): Promise<AssessmentDto> {
    const subject = await this.prisma.subject.findUniqueOrThrow({
      where: { uid: input.subjectUid },
    });

    checkPermission(currentUser, subject.tenantUid);

    const assessment = await this.prisma.assessment.create({
      data: {
        subject: {
          connect: {
            uid: input.subjectUid,
          },
        },
        tenant: {
          connect: {
            uid: input.tenantUid,
          },
        },
        user: {
          connect: {
            uid: currentUser.uid,
          },
        },
        // 初期値を設定
        careLevel: CareLevel.NEEDS_CARE_1,
        physicalIndependence: IndependenceLevel.INDEPENDENT,
        cognitiveIndependence: CognitiveIndependence.INDEPENDENT,
      },
      include: {
        subject: true,
      },
    });

    return plainToInstance(AssessmentDto, assessment, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    input: AssessmentUpdateInputDto,
    currentUser: User,
  ): Promise<AssessmentDto> {
    const targetAssessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
      include: {
        subject: true,
      },
    });

    checkPermission(currentUser, targetAssessment.tenantUid);

    const updatedAssessment = await this.prisma.assessment.update({
      where: { uid },
      data: {
        ...input,
        user: {
          connect: {
            uid: currentUser.uid,
          },
        },
      },
      include: {
        subject: true,
      },
    });

    return plainToInstance(AssessmentDto, updatedAssessment, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(uid: string, currentUser: User): Promise<AssessmentDto> {
    const assessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
      include: {
        subject: true,
      },
    });

    checkPermission(currentUser, assessment.tenantUid);

    return plainToInstance(AssessmentDto, assessment, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const targetAssessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, targetAssessment.tenantUid);

    await this.prisma.assessment.delete({ where: { uid } });
  }

  async getTranscription(
    uid: string,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const assessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
      select: { transcription: true, tenantUid: true },
    });

    checkPermission(currentUser, assessment.tenantUid);

    return plainToInstance(TranscriptionDto, assessment, {
      excludeExtraneousValues: true,
    });
  }

  async appendTranscription(
    uid: string,
    input: TranscriptionInputDto,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const assessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
      select: { transcription: true, tenantUid: true },
    });

    checkPermission(currentUser, assessment.tenantUid);

    const updatedAssessment = await this.prisma.assessment.update({
      where: { uid },
      data: {
        transcription: assessment.transcription
          ? `${assessment.transcription}\n${input.transcription}`
          : input.transcription,
      },
      select: { transcription: true },
    });

    return plainToInstance(TranscriptionDto, updatedAssessment, {
      excludeExtraneousValues: true,
    });
  }

  async updateTranscription(
    uid: string,
    input: TranscriptionInputDto,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const assessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
      select: { tenantUid: true },
    });

    checkPermission(currentUser, assessment.tenantUid);

    const updatedAssessment = await this.prisma.assessment.update({
      where: { uid },
      data: {
        transcription: input.transcription,
      },
      select: { transcription: true },
    });

    return plainToInstance(TranscriptionDto, updatedAssessment, {
      excludeExtraneousValues: true,
    });
  }

  async deleteTranscription(uid: string, currentUser: User): Promise<void> {
    const assessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
      select: { tenantUid: true },
    });

    checkPermission(currentUser, assessment.tenantUid);

    await this.prisma.assessment.update({
      where: { uid },
      data: {
        transcription: null,
      },
    });
  }

  async findByTenant(tenantUid: string): Promise<AssessmentListResponseDto> {
    const where = { tenantUid };

    const [items, total] = await Promise.all([
      this.prisma.assessment.findMany({
        where,
        include: {
          subject: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assessment.count({ where }),
    ]);

    return {
      items: plainToInstance(AssessmentDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async summarize(uid: string, currentUser: User): Promise<string> {
    const assessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, assessment.tenantUid);

    return (await summarize(assessment.transcription)).toString();
  }

  async extract(uid: string, currentUser: User): Promise<AssessmentDto> {
    const assessment = await this.prisma.assessment.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, assessment.tenantUid);

    const result = await extractData(assessment.transcription, assessment);
    return plainToInstance(AssessmentDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
