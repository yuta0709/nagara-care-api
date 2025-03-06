import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { User as UserDecorator } from '../users/user.decorator';
import { User } from '@prisma/client';
import { ThreadListOutputDto } from './dtos/thread-list.output.dto';
import { ThreadOutputDto } from './dtos/thread.output.dto';
import { MessageCreateInputDto } from './dtos/message-create.input.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Authorize } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';
import { ThreadUpdateInputDto } from './dtos/thread-update.input.dto';
import { ThreadCreateOutputDto } from './dtos/thread-create.output.dto';

@ApiTags('chats')
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'createThread',
    summary: '新しいスレッドを作成',
  })
  @ApiResponse({
    status: 201,
    description: 'スレッドの作成に成功',
    type: ThreadCreateOutputDto,
  })
  async createThread(@UserDecorator() user: User) {
    return this.chatService.createThread(user);
  }

  @Get()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getThreads',
    summary: 'スレッド一覧を取得',
  })
  @ApiResponse({
    status: 200,
    description: 'スレッド一覧の取得に成功',
    type: ThreadListOutputDto,
  })
  async getThreads(@UserDecorator() user: User): Promise<ThreadListOutputDto> {
    return this.chatService.getThreads(user);
  }

  @Get(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getThread',
    summary: '特定のスレッドを取得',
  })
  @ApiParam({
    name: 'uid',
    required: true,
    description: 'スレッドのUID',
  })
  @ApiResponse({
    status: 200,
    description: 'スレッドの取得に成功',
    type: ThreadOutputDto,
  })
  async getThread(@Param('uid') uid: string): Promise<ThreadOutputDto> {
    return this.chatService.getThread(uid);
  }

  @Put(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateThread',
    summary: 'スレッドを更新',
  })
  @ApiParam({
    name: 'uid',
    required: true,
    description: 'スレッドのUID',
  })
  async updateThread(
    @Param('uid') uid: string,
    @Body() input: ThreadUpdateInputDto,
    @UserDecorator() user: User,
  ) {
    return this.chatService.updateThread(uid, input, user);
  }

  @Delete(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteThread',
    summary: 'スレッドを削除',
  })
  @ApiParam({
    name: 'uid',
    required: true,
    description: 'スレッドのUID',
  })
  async deleteThread(@Param('uid') uid: string, @UserDecorator() user: User) {
    return this.chatService.deleteThread(uid, user);
  }

  @Post(':uid/messages')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'createMessage',
    summary: 'メッセージを作成',
  })
  @ApiParam({
    name: 'uid',
    required: true,
    description: 'スレッドのUID',
  })
  @ApiResponse({
    status: 201,
    description: 'メッセージの作成に成功',
  })
  async createMessage(
    @Param('uid') threadUid: string,
    @UserDecorator() user: User,
    @Body() input: MessageCreateInputDto,
  ) {
    return this.chatService.createMessage(threadUid, user, input);
  }
}
