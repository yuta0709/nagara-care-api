import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantCreateInputDto } from './dtos/tenant-create.input.dto';
import { TenantUpdateInputDto } from './dtos/tenant-update.input.dto';
import { Authorize } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { User as UserDecorator } from '../users/user.decorator';
import { User } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { TenantCreateOutputDto } from './dtos/tenant-create.output.dto';
import { TenantListResponseDto } from './dtos/tenant-list.output.dto';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Authorize([UserRole.GLOBAL_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'テナント一覧を取得' })
  @ApiResponse({
    status: 200,
    description: 'テナント一覧の取得に成功',
    type: TenantListResponseDto,
  })
  findAll(): Promise<TenantListResponseDto> {
    return this.tenantsService.findAll();
  }

  @Post()
  @Authorize([UserRole.GLOBAL_ADMIN])
  @ApiOperation({ summary: 'テナントを作成する' })
  @ApiResponse({
    status: 201,
    description: 'テナントが正常に作成されました',
  })
  async create(@Body() createTenantDto: TenantCreateInputDto) {
    const tenant = await this.tenantsService.create(createTenantDto);
    return plainToClass(TenantCreateOutputDto, tenant);
  }

  @Patch(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'テナントを更新' })
  @ApiParam({ name: 'uid', description: 'テナントUID' })
  @ApiResponse({
    status: 200,
    description: 'テナントの更新に成功',
    type: TenantCreateOutputDto,
  })
  update(
    @Param('uid') uid: string,
    @Body() input: TenantUpdateInputDto,
    @UserDecorator() user: User,
  ) {
    return this.tenantsService.update(uid, input, user);
  }

  @Delete(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'テナントを削除' })
  @ApiParam({ name: 'uid', description: 'テナントUID' })
  @ApiResponse({
    status: 200,
    description: 'テナントの削除に成功',
  })
  delete(@Param('uid') uid: string, @UserDecorator() user: User) {
    return this.tenantsService.delete(uid, user);
  }
}
