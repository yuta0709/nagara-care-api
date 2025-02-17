import { Module } from '@nestjs/common';
import { BeverageRecordsService } from './beverage-records.service';
import { BeverageRecordsController } from './beverage-records.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BeverageRecordsController],
  providers: [BeverageRecordsService, PrismaService],
  exports: [BeverageRecordsService],
})
export class BeverageRecordsModule {}
