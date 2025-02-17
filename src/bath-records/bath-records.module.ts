import { Module } from '@nestjs/common';
import { BathRecordsService } from './bath-records.service';
import { BathRecordsController } from './bath-records.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BathRecordsController],
  providers: [BathRecordsService, PrismaService],
  exports: [BathRecordsService],
})
export class BathRecordsModule {}
