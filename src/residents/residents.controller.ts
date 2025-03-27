import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ResidentsService } from './residents.service';
import { ResidentCreateInputDto } from './dtos/resident-create.input.dto';
import { ResidentUpdateInputDto } from './dtos/resident-update.input.dto';
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
import { ResidentListResponseDto } from './dtos/resident-list.output.dto';
import { ResidentDto } from './dtos/resident.output.dto';

@Authorize([UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
@ApiBearerAuth('JWT-auth')
@ApiTags('residents')
@Controller()
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Get('tenants/:tenantUid/residents')
  @ApiOperation({
    operationId: 'getResidents',
    summary: 'テナント内の利用者一覧を取得',
  })
  @ApiParam({
    name: 'tenantUid',
    required: false,
    description: 'テナントUID',
  })
  @ApiResponse({
    status: 200,
    description: '利用者一覧の取得に成功',
    type: ResidentListResponseDto,
  })
  findByTenant(
    @Param('tenantUid') tenantUid: string,
    @UserDecorator() user: User,
  ): Promise<ResidentListResponseDto> {
    return this.residentsService.findByTenant(tenantUid, user);
  }

  @Post('tenants/:tenantUid/residents')
  @ApiOperation({
    operationId: 'createResident',
    summary: 'テナントに利用者を作成',
  })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiResponse({
    status: 201,
    description: '利用者の作成に成功',
    type: ResidentDto,
  })
  createResident(
    @Param('tenantUid') tenantUid: string,
    @Body() input: ResidentCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<ResidentDto> {
    return this.residentsService.create(input, user);
  }

  @Get('tenants/:tenantUid/residents/:uid')
  @ApiOperation({
    operationId: 'getResident',
    summary: '利用者の詳細を取得',
  })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiParam({ name: 'uid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '利用者の詳細取得に成功',
    type: ResidentDto,
  })
  findOne(
    @Param('tenantUid') tenantUid: string,
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<ResidentDto> {
    return this.residentsService.findOne(uid, user);
  }

  @Patch('tenants/:tenantUid/residents/:uid')
  @ApiOperation({
    operationId: 'updateResident',
    summary: '利用者を更新',
  })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiParam({ name: 'uid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '利用者の更新に成功',
    type: ResidentDto,
  })
  updateResident(
    @Param('tenantUid') tenantUid: string,
    @Param('uid') uid: string,
    @Body() input: ResidentUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<ResidentDto> {
    return this.residentsService.update(uid, input, user);
  }

  @Delete('tenants/:tenantUid/residents/:uid')
  @ApiOperation({
    operationId: 'deleteResident',
    summary: '利用者を削除',
  })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiParam({ name: 'uid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '利用者の削除に成功',
  })
  deleteResident(
    @Param('tenantUid') tenantUid: string,
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.residentsService.delete(uid, user);
  }
}
