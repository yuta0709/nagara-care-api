import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentCreateInputDto } from './dtos/assessment-create.input.dto';
import { AssessmentUpdateInputDto } from './dtos/assessment-update.input.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
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
import { AssessmentDto } from './dtos/assessment.output.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { AssessmentListResponseDto } from './dtos/assessment-list.output.dto';
import { summarize } from './llm/summarize';

@ApiTags('assessments')
@Controller()
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get('assessments')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getAssessments',
    summary: 'アセスメント一覧を取得',
  })
  @ApiResponse({
    status: 200,
    description: 'アセスメント一覧の取得に成功',
    type: AssessmentListResponseDto,
  })
  findAll(@UserDecorator() user: User): Promise<AssessmentListResponseDto> {
    return this.assessmentsService.findByTenant(user.tenantUid);
  }

  @Post('assessments')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'createAssessment',
    summary: 'アセスメントを作成',
  })
  @ApiResponse({
    status: 201,
    description: 'アセスメントの作成に成功',
    type: AssessmentDto,
  })
  create(
    @Body() input: AssessmentCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<AssessmentDto> {
    input.tenantUid = user.tenantUid!;
    return this.assessmentsService.create(input, user);
  }

  @Get('assessments/:uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getAssessment',
    summary: 'アセスメントの詳細を取得',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの詳細取得に成功',
    type: AssessmentDto,
  })
  findOne(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<AssessmentDto> {
    return this.assessmentsService.findOne(uid, user);
  }

  @Patch('assessments/:uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateAssessment',
    summary: 'アセスメントを更新',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの更新に成功',
    type: AssessmentDto,
  })
  update(
    @Param('uid') uid: string,
    @Body() input: AssessmentUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<AssessmentDto> {
    return this.assessmentsService.update(uid, input, user);
  }

  @Delete('assessments/:uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteAssessment',
    summary: 'アセスメントを削除',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの削除に成功',
  })
  delete(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.assessmentsService.delete(uid, user);
  }

  @Get('assessments/:uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getTranscription',
    summary: 'アセスメントの文字起こしを取得',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの文字起こし取得に成功',
    type: TranscriptionDto,
  })
  getTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.assessmentsService.getTranscription(uid, user);
  }

  @Patch('assessments/:uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'appendTranscription',
    summary: 'アセスメントの文字起こしを追記',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの文字起こし追記に成功',
    type: TranscriptionDto,
  })
  appendTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.assessmentsService.appendTranscription(uid, input, user);
  }

  @Put('assessments/:uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateTranscription',
    summary: 'アセスメントの文字起こしを置換',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの文字起こし置換に成功',
    type: TranscriptionDto,
  })
  updateTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.assessmentsService.updateTranscription(uid, input, user);
  }

  @Delete('assessments/:uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteTranscription',
    summary: 'アセスメントの文字起こしを削除',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの文字起こし削除に成功',
  })
  deleteTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.assessmentsService.deleteTranscription(uid, user);
  }

  @Post('assessments/:uid/summarize')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'summarizeAssessment',
    summary: 'アセスメントの要約を作成',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの要約作成に成功',
    type: String,
  })
  summarize(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<string> {
    return this.assessmentsService.summarize(uid, user);
  }
}
