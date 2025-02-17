import { Module } from '@nestjs/common';
import { EliminationRecordsService } from './elimination-records.service';
import { EliminationRecordsController } from './elimination-records.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [EliminationRecordsController],
  providers: [EliminationRecordsService, PrismaService],
  exports: [EliminationRecordsService],
})
export class EliminationRecordsModule {}
