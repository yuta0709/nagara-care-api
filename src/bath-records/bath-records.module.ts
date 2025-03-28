import { Module } from '@nestjs/common';
import { BathRecordsService } from './bath-records.service';
import { BathRecordsController } from './bath-records.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [BathRecordsController],
  providers: [BathRecordsService],
})
export class BathRecordsModule {}
