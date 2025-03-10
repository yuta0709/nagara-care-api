import { Module } from '@nestjs/common';
import { QaController } from './qa.controller';
import { QaService } from './qa.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [QaController],
  providers: [QaService, PrismaService],
  exports: [QaService],
})
export class QaModule {}
