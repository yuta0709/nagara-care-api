import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { TenantUserCreateInputDto } from './dtos/tenant-user-create.input.dto';
import { Authorize } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
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
  ) {
    input.tenantUid = tenantUid;
    return this.usersService.createTenantUser(input, user);
  }
}
