import { Injectable } from '@nestjs/common';
import { MessageRole, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
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
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createThread(user: User) {
    const title = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return this.prisma.thread.create({
      data: {
        createdByUid: user.uid,
        title,
      },
    });
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

    const messages = thread.messages.map((message) => {
      return new ChatMessage({
        role: message.role.toLowerCase(),
        content: message.content,
      });
    });

    const userMessage = new ChatMessage({
      role: 'user',
      content: input.content,
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
