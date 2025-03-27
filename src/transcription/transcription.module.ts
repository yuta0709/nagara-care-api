import { Module } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { TranscriptionController } from './transcription.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [TranscriptionService, PrismaService],
  controllers: [TranscriptionController],
})
export class TranscriptionModule {}
