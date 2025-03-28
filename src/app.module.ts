import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { ResidentsModule } from './residents/residents.module';
import { FoodRecordsModule } from './food-records/food-records.module';
import { BathRecordsModule } from './bath-records/bath-records.module';
import { BeverageRecordsModule } from './beverage-records/beverage-records.module';
import { EliminationRecordsModule } from './elimination-records/elimination-records.module';
import { DailyRecordsModule } from './daily-records/daily-records.module';
import { SeedModule } from './seed/seed.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ChatModule } from './chat/chat.module';
import { QaModule } from './qa/qa.module';
import { TranscriptionModule } from './transcription/transcription.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TenantsModule,
    ResidentsModule,
    FoodRecordsModule,
    BathRecordsModule,
    EliminationRecordsModule,
    DailyRecordsModule,
    BeverageRecordsModule,
    SeedModule,
    AssessmentsModule,
    SubjectsModule,
    ChatModule,
    QaModule,
    TranscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
