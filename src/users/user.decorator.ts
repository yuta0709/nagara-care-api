import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';

export const User = createParamDecorator(
  (_, ctx: ExecutionContext): PrismaUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
