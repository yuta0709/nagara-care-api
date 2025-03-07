import { Module } from '@nestjs/common';
import { FoodRecordsService } from './food-records.service';
import { FoodRecordsController } from './food-records.controller';
import { PrismaService } from '../prisma.service';
import { PineconeService } from 'src/pinecone.service';

@Module({
  controllers: [FoodRecordsController],
  providers: [FoodRecordsService, PrismaService, PineconeService],
  exports: [FoodRecordsService],
})
export class FoodRecordsModule {}
