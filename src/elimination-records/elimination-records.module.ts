import { Module } from '@nestjs/common';
import { EliminationRecordsService } from './elimination-records.service';
import { EliminationRecordsController } from './elimination-records.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EliminationRecordsController],
  providers: [EliminationRecordsService],
})
export class EliminationRecordsModule {}
