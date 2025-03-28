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

@Authorize([UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
@ApiBearerAuth('JWT-auth')
@ApiTags('subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({
    operationId: 'getSubjects',
    summary: 'テナント内のアセスメント対象者一覧を取得',
  })
  @ApiParam({
    name: 'tenantUid',
    required: false,
    description: 'テナントUID',
  })
  @ApiResponse({
    status: 200,
    description: 'アセスメント対象者一覧の取得に成功',
    type: SubjectListResponseDto,
  })
  findByTenant(@UserDecorator() user: User): Promise<SubjectListResponseDto> {
    return this.subjectsService.findByTenant(user);
  }

  @Post()
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
    @Body() input: SubjectCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<SubjectDto> {
    return this.subjectsService.create(input, user);
  }

  @Get(':uid')
  @ApiOperation({
    operationId: 'getSubject',
    summary: 'アセスメント対象者の詳細を取得',
  })
  @ApiParam({ name: 'uid', description: 'アセスメント対象者UID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメント対象者の詳細取得に成功',
    type: SubjectDto,
  })
  findOne(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<SubjectDto> {
    return this.subjectsService.findOne(uid, user);
  }

  @Patch(':uid')
  @ApiOperation({
    operationId: 'updateSubject',
    summary: 'アセスメント対象者を更新',
  })
  @ApiParam({ name: 'uid', description: 'アセスメント対象者UID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメント対象者の更新に成功',
    type: SubjectDto,
  })
  updateSubject(
    @Param('uid') uid: string,
    @Body() input: SubjectUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<SubjectDto> {
    return this.subjectsService.update(uid, input, user);
  }

  @Delete(':uid')
  @ApiOperation({
    operationId: 'deleteSubject',
    summary: 'アセスメント対象者を削除',
  })
  @ApiParam({ name: 'uid', description: 'アセスメント対象者UID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメント対象者の削除に成功',
  })
  deleteSubject(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.subjectsService.delete(uid, user);
  }
}
