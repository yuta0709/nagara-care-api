import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectCreateInputDto } from './dtos/subject-create.input.dto';
import { SubjectUpdateInputDto } from './dtos/subject-update.input.dto';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { SubjectDto } from './dtos/subject.output.dto';
import { SubjectListResponseDto } from './dtos/subject-list.output.dto';
import { checkPermission } from 'src/common/permission';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(currentUser: User): Promise<SubjectListResponseDto> {
    const [items, total] = await Promise.all([
      this.prisma.subject.findMany({
        where: { tenantUid: currentUser.tenantUid },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subject.count({
        where: { tenantUid: currentUser.tenantUid },
      }),
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
            uid: currentUser.tenantUid,
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
    const targetSubject = await this.prisma.subject.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, targetSubject.tenantUid);

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
    const targetSubject = await this.prisma.subject.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, targetSubject.tenantUid);

    await this.prisma.subject.delete({ where: { uid } });
  }

  async findOne(uid: string, currentUser: User): Promise<SubjectDto> {
    const subject = await this.prisma.subject.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, subject.tenantUid);

    return plainToInstance(SubjectDto, subject, {
      excludeExtraneousValues: true,
    });
  }
}
