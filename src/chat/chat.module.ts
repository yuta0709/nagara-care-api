import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma.service';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatService, PrismaService],
  controllers: [ChatController],
})
export class ChatModule {}
