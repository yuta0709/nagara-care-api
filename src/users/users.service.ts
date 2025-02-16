import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserCreateTenantAdmin } from './dtos/user-create-tenant-admin.input.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { UserCreateGlobalAdmin } from './dtos/user-create-global-admin.input.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByLoginId(loginId: string) {
    const user = await this.prisma.user.findUnique({
      where: { loginId },
    });

    return plainToInstance(User, user);
  }

  async createTenantAdmin(input: UserCreateTenantAdmin) {
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

    return plainToInstance(User, user);
  }

  async createOrUpdateGlobalAdmin(input: UserCreateGlobalAdmin) {
    const passwordDigest = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.upsert({
      where: { loginId: input.loginId },
      update: {
        passwordDigest: passwordDigest,
        familyName: input.familyName,
        givenName: input.givenName,
        familyNameFurigana: input.familyNameFurigana,
        givenNameFurigana: input.givenNameFurigana,
      },
      create: {
        loginId: input.loginId,
        passwordDigest: passwordDigest,
        familyName: input.familyName,
        givenName: input.givenName,
        familyNameFurigana: input.familyNameFurigana,
        givenNameFurigana: input.givenNameFurigana,
        role: UserRole.GLOBAL_ADMIN,
      },
    });
    return plainToInstance(User, user);
  }
}
