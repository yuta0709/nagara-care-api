import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PineconeService } from 'src/pinecone/pinecone.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PineconeModule } from 'src/pinecone/pinecone.module';

@Module({
  imports: [PrismaModule, PineconeModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
