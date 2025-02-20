import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SubjectCreateInputDto } from './dtos/subject-create.input.dto';
import { SubjectUpdateInputDto } from './dtos/subject-update.input.dto';
import { User, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { SubjectDto } from './dtos/subject.output.dto';
import { SubjectListResponseDto } from './dtos/subject-list.output.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(
    tenantUid: string | null,
    currentUser: User,
  ): Promise<SubjectListResponseDto> {
    // GLOBAL_ADMINの場合、tenantUidがnullなら全テナントの対象者を取得
    const where =
      currentUser.role === UserRole.GLOBAL_ADMIN && !tenantUid
        ? {}
        : { tenantUid: tenantUid ?? currentUser.tenantUid };

    const [items, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      items: plainToInstance(SubjectDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async create(
    input: SubjectCreateInputDto,
    currentUser: User,
  ): Promise<SubjectDto> {
    // TENANT_ADMINは自身のテナントにのみ作成可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      currentUser.tenantUid !== input.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントにアセスメント対象者を作成する権限がありません',
      );
    }

    const subject = await this.prisma.subject.create({
      data: {
        familyName: input.familyName,
        givenName: input.givenName,
        familyNameFurigana: input.familyNameFurigana,
        givenNameFurigana: input.givenNameFurigana,
        dateOfBirth: new Date(input.dateOfBirth),
        gender: input.gender,
        tenant: {
          connect: {
            uid: input.tenantUid,
          },
        },
      },
    });

    return plainToInstance(SubjectDto, subject, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    input: SubjectUpdateInputDto,
    currentUser: User,
  ): Promise<SubjectDto> {
    const targetSubject = await this.prisma.subject.findUnique({
      where: { uid },
    });
    if (!targetSubject) {
      throw new NotFoundException(
        `アセスメント対象者が見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントの対象者のみ更新可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      targetSubject.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメント対象者を更新する権限がありません',
      );
    }

    const data: any = { ...input };
    if (input.dateOfBirth) {
      data.dateOfBirth = new Date(input.dateOfBirth);
    }

    const updatedSubject = await this.prisma.subject.update({
      where: { uid },
      data,
    });

    return plainToInstance(SubjectDto, updatedSubject, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const targetSubject = await this.prisma.subject.findUnique({
      where: { uid },
    });
    if (!targetSubject) {
      throw new NotFoundException(
        `アセスメント対象者が見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINは自身のテナントの対象者のみ削除可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      targetSubject.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメント対象者を削除する権限がありません',
      );
    }

    await this.prisma.subject.delete({ where: { uid } });
  }

  async findOne(uid: string, currentUser: User): Promise<SubjectDto> {
    const subject = await this.prisma.subject.findUnique({
      where: { uid },
    });

    if (!subject) {
      throw new NotFoundException(
        `アセスメント対象者が見つかりません（UID: ${uid}）`,
      );
    }

    // TENANT_ADMINとCAREGIVERは自身のテナントの対象者のみ取得可能
    if (
      (currentUser.role === UserRole.TENANT_ADMIN ||
        currentUser.role === UserRole.CAREGIVER) &&
      subject.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのアセスメント対象者情報を取得する権限がありません',
      );
    }

    return plainToInstance(SubjectDto, subject, {
      excludeExtraneousValues: true,
    });
  }
}
