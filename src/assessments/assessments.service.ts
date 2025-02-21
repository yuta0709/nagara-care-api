import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AssessmentCreateInputDto } from './dtos/assessment-create.input.dto';
import { AssessmentUpdateInputDto } from './dtos/assessment-update.input.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import {
  User,
  UserRole,
  CareLevel,
  IndependenceLevel,
  CognitiveIndependence,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { AssessmentDto } from './dtos/assessment.output.dto';
import { AssessmentListResponseDto } from './dtos/assessment-list.output.dto';
import { summarize } from './llm/summarize';

@Injectable()
export class AssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: AssessmentCreateInputDto,
    currentUser: User,
  ): Promise<AssessmentDto> {
    // 対象者の存在確認
    const subject = await this.prisma.subject.findUnique({
      where: { uid: input.subjectUid },
    });
    if (!subject) {
      throw new NotFoundException(
        `アセスメント対象者が見つかりません（UID: ${input.subjectUid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントの対象者にのみアセスメントを作成可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      subject.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの対象者にアセスメントを作成する権限がありません',
      );
    }

    // すでにアセスメントが存在する場合はエラー
    const existingAssessment = await this.prisma.assessment.findUnique({
      where: { subjectUid: input.subjectUid },
    });
    if (existingAssessment) {
      throw new BadRequestException(
        `この対象者のアセスメントはすでに存在します（UID: ${existingAssessment.uid}）`,
      );
    }

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
    const targetAssessment = await this.prisma.assessment.findUnique({
      where: { uid },
      include: {
        subject: true,
      },
    });
    if (!targetAssessment) {
      throw new NotFoundException(
        `アセスメントが見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントのアセスメントのみ更新可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      targetAssessment.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメントを更新する権限がありません',
      );
    }

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
    const assessment = await this.prisma.assessment.findUnique({
      where: { uid },
      include: {
        subject: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException(
        `アセスメントが見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINとCAREGIVERは自身のテナントのアセスメントのみ取得可能
    if (
      (currentUser.role === UserRole.TENANT_ADMIN ||
        currentUser.role === UserRole.CAREGIVER) &&
      assessment.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメント情報を取得する権限がありません',
      );
    }

    return plainToInstance(AssessmentDto, assessment, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const targetAssessment = await this.prisma.assessment.findUnique({
      where: { uid },
    });
    if (!targetAssessment) {
      throw new NotFoundException(
        `アセスメントが見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントのアセスメントのみ削除可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      targetAssessment.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメントを削除する権限がありません',
      );
    }

    await this.prisma.assessment.delete({ where: { uid } });
  }

  async getTranscription(
    uid: string,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true },
    });

    if (!assessment) {
      throw new NotFoundException(
        `アセスメントが見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINとCAREGIVERは自身のテナントのアセスメントのみ取得可能
    if (
      (currentUser.role === UserRole.TENANT_ADMIN ||
        currentUser.role === UserRole.CAREGIVER) &&
      assessment.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメント情報を取得する権限がありません',
      );
    }

    return plainToInstance(TranscriptionDto, assessment, {
      excludeExtraneousValues: true,
    });
  }

  async appendTranscription(
    uid: string,
    input: TranscriptionInputDto,
    currentUser: User,
  ): Promise<TranscriptionDto> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { uid },
      select: { transcription: true, tenantUid: true },
    });

    if (!assessment) {
      throw new NotFoundException(
        `アセスメントが見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントのアセスメントのみ更新可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      assessment.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメントを更新する権限がありません',
      );
    }

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
    const assessment = await this.prisma.assessment.findUnique({
      where: { uid },
      select: { tenantUid: true },
    });

    if (!assessment) {
      throw new NotFoundException(
        `アセスメントが見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントのアセスメントのみ更新可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      assessment.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメントを更新する権限がありません',
      );
    }

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
    const assessment = await this.prisma.assessment.findUnique({
      where: { uid },
      select: { tenantUid: true },
    });

    if (!assessment) {
      throw new NotFoundException(
        `アセスメントが見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントのアセスメントのみ更新可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      assessment.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメントを更新する権限がありません',
      );
    }

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
    const assessment = await this.prisma.assessment.findUnique({
      where: { uid },
    });

    if (!assessment) {
      throw new NotFoundException(
        `アセスメントが見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントのアセスメントのみ要約可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      assessment.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメントを要約する権限がありません',
      );
    }

    return (await summarize(assessment.transcription)).toString();
  }
}
