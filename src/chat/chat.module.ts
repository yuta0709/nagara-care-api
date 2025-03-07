import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma.service';
import { ChatController } from './chat.controller';
import { PineconeService } from 'src/pinecone.service';

@Module({
  providers: [ChatService, PrismaService, PineconeService],
  controllers: [ChatController],
})
export class ChatModule {}
