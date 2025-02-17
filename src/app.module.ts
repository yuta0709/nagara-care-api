import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { ResidentsModule } from './residents/residents.module';
import { FoodRecordsModule } from './food-records/food-records.module';
import { BathRecordsModule } from './bath-records/bath-records.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TenantsModule,
    ResidentsModule,
    FoodRecordsModule,
    BathRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
