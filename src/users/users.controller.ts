import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TenantUserCreateInputDto } from './dtos/tenant-user-create.input.dto';
import { UserUpdateInputDto } from './dtos/user-update.input.dto';
import { Authorize } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { User as UserDecorator } from './user.decorator';
import { UserListResponseDto } from './dtos/user-list.output.dto';
import { UserDto } from './dtos/user.output.dto';

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('tenants/:tenantUid/users')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'テナント内のユーザー一覧を取得' })
  @ApiParam({
    name: 'tenantUid',
    required: false,
    description:
      'テナントUID（GLOBAL_ADMINの場合、省略すると全テナントのユーザーを取得）',
  })
  @ApiResponse({
    status: 200,
    description: 'ユーザー一覧の取得に成功',
    type: UserListResponseDto,
  })
  findByTenant(
    @Param('tenantUid') tenantUid: string | null,
    @UserDecorator() user: User,
  ): Promise<UserListResponseDto> {
    return this.usersService.findByTenant(tenantUid, user);
  }

  @Post('tenants/:tenantUid/users')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'テナントにユーザーを作成' })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiResponse({
    status: 201,
    description: 'ユーザーの作成に成功',
    type: UserDto,
  })
  async createUser(
    @Param('tenantUid') tenantUid: string,
    @Body() input: TenantUserCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<UserDto> {
    input.tenantUid = tenantUid;
    return this.usersService.createTenantUser(input, user);
  }

  @Patch('users/:uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ユーザーを更新' })
  @ApiParam({ name: 'uid', description: 'ユーザーUID' })
  @ApiResponse({
    status: 200,
    description: 'ユーザーの更新に成功',
    type: UserDto,
  })
  updateUser(
    @Param('uid') uid: string,
    @Body() input: UserUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<UserDto> {
    return this.usersService.update(uid, input, user);
  }

  @Delete('users/:uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ユーザーを削除' })
  @ApiParam({ name: 'uid', description: 'ユーザーUID' })
  @ApiResponse({
    status: 200,
    description: 'ユーザーの削除に成功',
  })
  deleteUser(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.usersService.delete(uid, user);
  }
}
