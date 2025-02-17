import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResidentCreateInputDto } from './dtos/resident-create.input.dto';
import { ResidentUpdateInputDto } from './dtos/resident-update.input.dto';
import { User, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ResidentDto } from './dtos/resident.output.dto';
import { ResidentListResponseDto } from './dtos/resident-list.output.dto';

@Injectable()
export class ResidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(
    tenantUid: string | null,
    currentUser: User,
  ): Promise<ResidentListResponseDto> {
    // GLOBAL_ADMINの場合、tenantUidがnullなら全テナントの利用者を取得
    const where =
      currentUser.role === UserRole.GLOBAL_ADMIN && !tenantUid
        ? {}
        : { tenantUid: tenantUid ?? currentUser.tenantUid };

    const [items, total] = await Promise.all([
      this.prisma.resident.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resident.count({ where }),
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
    // TENANT_ADMINは自身のテナントにのみ作成可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      currentUser.tenantUid !== input.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントに利用者を作成する権限がありません',
      );
    }

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
            uid: input.tenantUid,
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
    const targetResident = await this.prisma.resident.findUnique({
      where: { uid },
    });
    if (!targetResident) {
      throw new NotFoundException(`Resident with uid ${uid} not found`);
    }

    // TENANT_ADMINは自身のテナントの利用者のみ更新可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      targetResident.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者を更新する権限がありません',
      );
    }

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
    const targetResident = await this.prisma.resident.findUnique({
      where: { uid },
    });
    if (!targetResident) {
      throw new NotFoundException(`Resident with uid ${uid} not found`);
    }

    // TENANT_ADMINは自身のテナントの利用者のみ削除可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      targetResident.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントの利用者を削除する権限がありません',
      );
    }

    await this.prisma.resident.delete({ where: { uid } });
  }
}
