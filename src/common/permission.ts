import { User } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

export function checkPermission(user: User, tenantUid: string) {
  if (user.tenantUid !== tenantUid) {
    throw new ForbiddenException();
  }
}
