import { Module } from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { DailyRecordsController } from './daily-records.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DailyRecordsController],
  providers: [DailyRecordsService, PrismaService],
  exports: [DailyRecordsService],
})
export class DailyRecordsModule {}
