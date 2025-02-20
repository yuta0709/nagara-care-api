import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectCreateInputDto } from './dtos/subject-create.input.dto';
import { SubjectUpdateInputDto } from './dtos/subject-update.input.dto';
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
import { SubjectListResponseDto } from './dtos/subject-list.output.dto';
import { SubjectDto } from './dtos/subject.output.dto';

@ApiTags('subjects')
@Controller()
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get('tenants/:tenantUid/subjects')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getSubjects',
    summary: 'テナント内のアセスメント対象者一覧を取得',
  })
  @ApiParam({
    name: 'tenantUid',
    required: false,
    description:
      'テナントUID（GLOBAL_ADMINの場合、省略すると全テナントのアセスメント対象者を取得）',
  })
  @ApiResponse({
    status: 200,
    description: 'アセスメント対象者一覧の取得に成功',
    type: SubjectListResponseDto,
  })
  findByTenant(
    @Param('tenantUid') tenantUid: string | null,
    @UserDecorator() user: User,
  ): Promise<SubjectListResponseDto> {
    return this.subjectsService.findByTenant(tenantUid, user);
  }

  @Post('tenants/:tenantUid/subjects')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'createSubject',
    summary: 'テナントにアセスメント対象者を作成',
  })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiResponse({
    status: 201,
    description: 'アセスメント対象者の作成に成功',
    type: SubjectDto,
  })
  createSubject(
    @Param('tenantUid') tenantUid: string,
    @Body() input: SubjectCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<SubjectDto> {
    input.tenantUid = tenantUid;
    return this.subjectsService.create(input, user);
  }

  @Get('tenants/:tenantUid/subjects/:uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getSubject',
    summary: 'アセスメント対象者の詳細を取得',
  })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiParam({ name: 'uid', description: 'アセスメント対象者UID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメント対象者の詳細取得に成功',
    type: SubjectDto,
  })
  findOne(
    @Param('tenantUid') tenantUid: string,
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<SubjectDto> {
    return this.subjectsService.findOne(uid, user);
  }

  @Patch('tenants/:tenantUid/subjects/:uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateSubject',
    summary: 'アセスメント対象者を更新',
  })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiParam({ name: 'uid', description: 'アセスメント対象者UID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメント対象者の更新に成功',
    type: SubjectDto,
  })
  updateSubject(
    @Param('tenantUid') tenantUid: string,
    @Param('uid') uid: string,
    @Body() input: SubjectUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<SubjectDto> {
    return this.subjectsService.update(uid, input, user);
  }

  @Delete('tenants/:tenantUid/subjects/:uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteSubject',
    summary: 'アセスメント対象者を削除',
  })
  @ApiParam({ name: 'tenantUid', description: 'テナントUID' })
  @ApiParam({ name: 'uid', description: 'アセスメント対象者UID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメント対象者の削除に成功',
  })
  deleteSubject(
    @Param('tenantUid') tenantUid: string,
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.subjectsService.delete(uid, user);
  }
}
