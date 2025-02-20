import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AssessmentsController],
  providers: [AssessmentsService, PrismaService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
