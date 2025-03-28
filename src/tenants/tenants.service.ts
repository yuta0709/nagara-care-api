import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantCreateInputDto } from './dtos/tenant-create.input.dto';
import { Tenant, User, UserRole } from '@prisma/client';
import {
  TenantListItemDto,
  TenantListResponseDto,
} from './dtos/tenant-list.output.dto';
import { plainToInstance } from 'class-transformer';
import { TenantUpdateInputDto } from './dtos/tenant-update.input.dto';
import { TenantDto } from './dtos/tenant.output.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  // テナントを作成する
  async create(data: TenantCreateInputDto): Promise<TenantDto> {
    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.name,
      },
    });

    return plainToInstance(TenantDto, tenant);
  }

  // テナント一覧を取得する
  async findAll(): Promise<TenantListResponseDto> {
    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      items: plainToInstance(TenantListItemDto, items),
      total,
    };
  }

  // テナントを更新する
  async update(
    uid: string,
    input: TenantUpdateInputDto,
    currentUser: User,
  ): Promise<TenantDto> {
    // TENANT_ADMINは自身のテナントのみ更新可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      currentUser.tenantUid !== uid
    ) {
      throw new UnauthorizedException('他のテナントを更新する権限がありません');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { uid } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with uid ${uid} not found`);
    }
    const updatedTenant = await this.prisma.tenant.update({
      where: { uid },
      data: input,
    });

    return plainToInstance(TenantDto, updatedTenant);
  }

  // テナントを削除する
  async delete(uid: string, currentUser: User) {
    if (currentUser.role !== UserRole.GLOBAL_ADMIN) {
      throw new UnauthorizedException('管理者権限が必要です');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { uid } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with uid ${uid} not found`);
    }

    // テナントに所属するユーザーも削除
    await this.prisma.$transaction([
      this.prisma.user.deleteMany({ where: { tenantUid: uid } }),
      this.prisma.tenant.delete({ where: { uid } }),
    ]);

    return;
  }

  async findOne(uid: string, user: User): Promise<TenantDto> {
    // GLOBAL_ADMINは全テナントにアクセス可能
    // TENANT_ADMINは自分のテナントのみアクセス可能
    if (user.role === UserRole.TENANT_ADMIN && user.tenantUid !== uid) {
      throw new UnauthorizedException(
        'このテナントへのアクセス権限がありません',
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { uid },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with uid ${uid} not found`);
    }

    return plainToInstance(TenantDto, tenant);
  }
}
