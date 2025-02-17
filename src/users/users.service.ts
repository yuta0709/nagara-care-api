import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { UserCreateTenantAdmin } from './dtos/user-create-tenant-admin.input.dto';
import { UserCreateGlobalAdmin } from './dtos/user-create-global-admin.input.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByLoginId(loginId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { loginId },
    });
    return user;
  }

  async findOneByUid(uid: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { uid },
    });
    return user;
  }

  async createTenantAdmin(input: UserCreateTenantAdmin): Promise<User> {
    const passwordDigest = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        loginId: input.loginId,
        passwordDigest: passwordDigest,
        familyName: input.familyName,
        givenName: input.givenName,
        familyNameFurigana: input.familyNameFurigana,
        givenNameFurigana: input.givenNameFurigana,
        role: UserRole.TENANT_ADMIN,
        tenant: {
          connect: {
            uid: input.tenantUid,
          },
        },
      },
    });

    return user;
  }

  async createOrUpdateGlobalAdmin(input: UserCreateGlobalAdmin): Promise<User> {
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

    return user;
  }
}
