import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, PrismaService, UsersService],
  exports: [TenantsService],
})
export class TenantsModule {}
