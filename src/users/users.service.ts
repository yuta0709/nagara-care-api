import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { TenantUserCreateInputDto } from './dtos/tenant-user-create.input.dto';
import { UserCreateGlobalAdmin } from './dtos/user-create-global-admin.input.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import {
  UserListItemDto,
  UserListResponseDto,
} from './dtos/user-list.output.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dtos/user.output.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(
    tenantUid: string | null,
    currentUser: User,
  ): Promise<UserListResponseDto> {
    // GLOBAL_ADMINの場合、tenantUidがnullなら全テナントのユーザーを取得
    const where =
      currentUser.role === UserRole.GLOBAL_ADMIN && !tenantUid
        ? {}
        : { tenantUid: tenantUid ?? currentUser.tenantUid };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: plainToInstance(UserListItemDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  // テナント内にユーザーを作成する
  async createTenantUser(
    input: TenantUserCreateInputDto,
    currentUser: User,
  ): Promise<UserDto> {
    // TENANT_ADMINは自身のテナントにのみ作成可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      currentUser.tenantUid !== input.tenantUid
    ) {
      throw new Error('Cannot create user for other tenants');
    }

    // ユーザー権限がTENANT_ADMINかCAREGIVERのみ指定できる
    if (
      input.role !== UserRole.TENANT_ADMIN &&
      input.role !== UserRole.CAREGIVER
    ) {
      throw new Error('Invalid user role');
    }

    const passwordDigest = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        loginId: input.loginId,
        passwordDigest: passwordDigest,
        familyName: input.familyName,
        givenName: input.givenName,
        familyNameFurigana: input.familyNameFurigana,
        givenNameFurigana: input.givenNameFurigana,
        role: input.role,
        tenant: {
          connect: {
            uid: input.tenantUid,
          },
        },
      },
    });

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async createOrUpdateGlobalAdmin(
    input: UserCreateGlobalAdmin,
  ): Promise<UserDto> {
    const passwordDigest = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.upsert({
      where: { loginId: input.loginId },
      create: {
        loginId: input.loginId,
        passwordDigest: passwordDigest,
        familyName: input.familyName,
        givenName: input.givenName,
        familyNameFurigana: input.familyNameFurigana,
        givenNameFurigana: input.givenNameFurigana,
        role: UserRole.GLOBAL_ADMIN,
      },
      update: {
        passwordDigest: passwordDigest,
        familyName: input.familyName,
        givenName: input.givenName,
        familyNameFurigana: input.familyNameFurigana,
        givenNameFurigana: input.givenNameFurigana,
      },
    });

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
