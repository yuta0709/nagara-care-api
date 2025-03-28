import { Injectable } from '@nestjs/common';
import { MessageRole, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ThreadListItemOutputDto,
  ThreadListOutputDto,
} from './dtos/thread-list.output.dto';
import { plainToInstance } from 'class-transformer';
import { ThreadOutputDto } from './dtos/thread.output.dto';
import { MessageOutputDto } from './dtos/message.output.dto';
import { MessageCreateInputDto } from './dtos/message-create.input.dto';
import { ChatMessage, HumanMessage } from '@langchain/core/messages';
import { getAiResponse } from './llm/chat';
import { ThreadUpdateInputDto } from './dtos/thread-update.input.dto';
import { ThreadCreateOutputDto } from './dtos/thread-create.output.dto';
import { PineconeService } from 'src/pinecone/pinecone.service';
@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pineconeService: PineconeService,
  ) {}

  async createThread(user: User) {
    const title = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const thread = await this.prisma.thread.create({
      data: {
        createdByUid: user.uid,
        title,
      },
    });

    return plainToInstance(ThreadCreateOutputDto, thread, {
      excludeExtraneousValues: true,
    });
  }

  async updateThread(uid: string, input: ThreadUpdateInputDto, user: User) {
    const thread = await this.prisma.thread.update({
      where: { uid, createdByUid: user.uid },
      data: { title: input.title },
    });

    return plainToInstance(ThreadCreateOutputDto, thread, {
      excludeExtraneousValues: true,
    });
  }

  async deleteThread(uid: string, user: User) {
    await this.prisma.thread.delete({
      where: { uid, createdByUid: user.uid },
    });

    return;
  }

  async getThreads(user: User): Promise<ThreadListOutputDto> {
    const [items, total] = await Promise.all([
      this.prisma.thread.findMany({
        where: {
          createdByUid: user.uid,
        },
      }),
      this.prisma.thread.count({
        where: {
          createdByUid: user.uid,
        },
      }),
    ]);

    return {
      items: plainToInstance(ThreadListItemOutputDto, items, {
        excludeExtraneousValues: true,
      }),
      total,
    };
  }

  async getThread(uid: string): Promise<ThreadOutputDto> {
    const thread = await this.prisma.thread.findUnique({
      where: { uid },
      include: {
        messages: true,
      },
    });

    if (!thread) {
      throw new Error('スレッドが見つかりません');
    }

    return plainToInstance(ThreadOutputDto, thread, {
      excludeExtraneousValues: true,
    });
  }

  async createMessage(
    threadUid: string,
    user: User,
    input: MessageCreateInputDto,
  ) {
    const thread = await this.prisma.thread.findUnique({
      where: { uid: threadUid },
      include: {
        messages: true,
      },
    });

    if (!thread) {
      throw new Error('スレッドが見つかりません');
    }

    await this.prisma.message.create({
      data: {
        threadUid,
        content: input.content,
        role: MessageRole.USER,
      },
    });

    const messages = thread.messages.map((message) => {
      return new ChatMessage({
        role: message.role.toLowerCase(),
        content: message.content,
      });
    });
    const query = `
    今日は${new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })}です。
    ${input.content}
    
    `;

    const retrievedDocs =
      await this.pineconeService.vectorStore.similaritySearch(query, 10, {
        tenantUid: user.tenantUid,
      });
    const docsContent = retrievedDocs.map((doc) => doc.pageContent).join('\n');

    const prompt = `[Context]\n${docsContent}\n\n[User]\n${input.content}\n\n`;

    const userMessage = new ChatMessage({
      role: 'user',
      content: prompt,
    });
    messages.push(userMessage);

    const response = await getAiResponse(messages);
    const message = await this.prisma.message.create({
      data: {
        threadUid,
        content: response.toString(),
        role: MessageRole.ASSISTANT,
      },
    });

    return;
  }
}
