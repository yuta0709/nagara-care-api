import { Module } from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { DailyRecordsController } from './daily-records.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PineconeModule } from 'src/pinecone/pinecone.module';

@Module({
  imports: [PrismaModule, PineconeModule],
  controllers: [DailyRecordsController],
  providers: [DailyRecordsService],
})
export class DailyRecordsModule {}
