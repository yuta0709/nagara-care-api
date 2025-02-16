import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantService } from './tenant/tenant.service';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [AuthModule, UsersModule, TenantModule],
  controllers: [AppController],
  providers: [AppService, TenantService],
})
export class AppModule {}
