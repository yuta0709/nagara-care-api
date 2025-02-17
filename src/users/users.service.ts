import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
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
import { UserUpdateInputDto } from './dtos/user-update.input.dto';

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
      throw new UnauthorizedException(
        '他のテナントにユーザーを作成する権限がありません',
      );
    }

    // TENANT_ADMINはGLOBAL_ADMINを作成できない
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      input.role === UserRole.GLOBAL_ADMIN
    ) {
      throw new UnauthorizedException('GLOBAL_ADMINを作成する権限がありません');
    }

    const passwordDigest = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        loginId: input.loginId,
        passwordDigest,
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

  async update(
    uid: string,
    input: UserUpdateInputDto,
    currentUser: User,
  ): Promise<UserDto> {
    const targetUser = await this.prisma.user.findUnique({ where: { uid } });
    if (!targetUser) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }

    // TENANT_ADMINは自身のテナントのユーザーのみ更新可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      targetUser.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのユーザーを更新する権限がありません',
      );
    }

    // TENANT_ADMINはGLOBAL_ADMINに変更できない
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      input.role === UserRole.GLOBAL_ADMIN
    ) {
      throw new UnauthorizedException(
        'ユーザーをGLOBAL_ADMINに変更する権限がありません',
      );
    }

    // GLOBAL_ADMINのロールはGLOBAL_ADMINのみ変更可能
    if (
      targetUser.role === UserRole.GLOBAL_ADMIN &&
      currentUser.role !== UserRole.GLOBAL_ADMIN
    ) {
      throw new UnauthorizedException(
        'GLOBAL_ADMINのロールを変更する権限がありません',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { uid },
      data: input,
    });

    return plainToInstance(UserDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async delete(uid: string, currentUser: User): Promise<void> {
    const targetUser = await this.prisma.user.findUnique({ where: { uid } });
    if (!targetUser) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }

    // TENANT_ADMINは自身のテナントのユーザーのみ削除可能
    if (
      currentUser.role === UserRole.TENANT_ADMIN &&
      targetUser.tenantUid !== currentUser.tenantUid
    ) {
      throw new UnauthorizedException(
        '他のテナントのユーザーを削除する権限がありません',
      );
    }

    // GLOBAL_ADMINは他のGLOBAL_ADMINのみ削除可能
    if (
      targetUser.role === UserRole.GLOBAL_ADMIN &&
      currentUser.role !== UserRole.GLOBAL_ADMIN
    ) {
      throw new UnauthorizedException('GLOBAL_ADMINを削除する権限がありません');
    }

    await this.prisma.user.delete({ where: { uid } });
  }
}
