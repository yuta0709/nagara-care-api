import { Module } from '@nestjs/common';
import { FoodRecordsService } from './food-records.service';
import { FoodRecordsController } from './food-records.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PineconeModule } from 'src/pinecone/pinecone.module';

@Module({
  imports: [PrismaModule, PineconeModule],
  controllers: [FoodRecordsController],
  providers: [FoodRecordsService],
})
export class FoodRecordsModule {}
