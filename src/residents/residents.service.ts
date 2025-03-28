import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResidentCreateInputDto } from './dtos/resident-create.input.dto';
import { ResidentUpdateInputDto } from './dtos/resident-update.input.dto';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ResidentDto } from './dtos/resident.output.dto';
import { ResidentListResponseDto } from './dtos/resident-list.output.dto';
import { checkPermission } from 'src/common/permission';

@Injectable()
export class ResidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(
    tenantUid: string,
    currentUser: User,
  ): Promise<ResidentListResponseDto> {
    const [items, total] = await Promise.all([
      this.prisma.resident.findMany({
        where: { tenantUid: tenantUid },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resident.count({ where: { tenantUid: tenantUid } }),
    ]);

    return {
      items: plainToInstance(ResidentDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async create(
    input: ResidentCreateInputDto,
    currentUser: User,
  ): Promise<ResidentDto> {
    const resident = await this.prisma.resident.create({
      data: {
        familyName: input.familyName,
        givenName: input.givenName,
        familyNameFurigana: input.familyNameFurigana,
        givenNameFurigana: input.givenNameFurigana,
        dateOfBirth: new Date(input.dateOfBirth),
        gender: input.gender,
        admissionDate: new Date(input.admissionDate),
        tenant: {
          connect: {
            uid: currentUser.tenantUid,
          },
        },
      },
    });

    return plainToInstance(ResidentDto, resident, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    input: ResidentUpdateInputDto,
    currentUser: User,
  ): Promise<ResidentDto> {
    const targetResident = await this.prisma.resident.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, targetResident.tenantUid);

    const data: any = { ...input };
    if (input.dateOfBirth) {
      data.dateOfBirth = new Date(input.dateOfBirth);
    }
    if (input.admissionDate) {
      data.admissionDate = new Date(input.admissionDate);
    }

    const updatedResident = await this.prisma.resident.update({
      where: { uid },
      data,
    });

    return plainToInstance(ResidentDto, updatedResident, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const targetResident = await this.prisma.resident.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, targetResident.tenantUid);

    await this.prisma.resident.delete({ where: { uid } });
  }

  async findOne(uid: string, currentUser: User): Promise<ResidentDto> {
    const resident = await this.prisma.resident.findUniqueOrThrow({
      where: { uid },
    });

    checkPermission(currentUser, resident.tenantUid);

    return plainToInstance(ResidentDto, resident, {
      excludeExtraneousValues: true,
    });
  }
}
