import { Module } from '@nestjs/common';
import { FoodRecordsService } from './food-records.service';
import { FoodRecordsController } from './food-records.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FoodRecordsController],
  providers: [FoodRecordsService, PrismaService],
  exports: [FoodRecordsService],
})
export class FoodRecordsModule {}
