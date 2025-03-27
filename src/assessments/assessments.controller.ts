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
import { AssessmentExtractDto } from './dtos/assessment-extract.output.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { AssessmentDto } from './dtos/assessment.output.dto';
import { AssessmentListResponseDto } from './dtos/assessment-list.output.dto';

@Authorize([UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
@ApiBearerAuth('JWT-auth')
@ApiTags('assessments')
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
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

  @Post()
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

  @Get(':uid')
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

  @Patch(':uid')
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

  @Delete(':uid')
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

  @Get(':uid/transcription')
  @ApiOperation({
    operationId: 'getAssessmentTranscription',
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

  @Patch(':uid/transcription')
  @ApiOperation({
    operationId: 'appendAssessmentTranscription',
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

  @Put(':uid/transcription')
  @ApiOperation({
    operationId: 'updateAssessmentTranscription',
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

  @Delete(':uid/transcription')
  @ApiOperation({
    operationId: 'deleteAssessmentTranscription',
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

  @Post(':uid/summarize')
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

  @Post(':uid/extract')
  @ApiOperation({
    operationId: 'extractAssessment',
    summary: 'アセスメントの内容を抽出',
  })
  @ApiParam({ name: 'uid', description: 'アセスメントUID' })
  @ApiResponse({
    status: 200,
    description: 'アセスメントの内容抽出に成功',
    type: AssessmentExtractDto,
  })
  extract(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<AssessmentExtractDto> {
    return this.assessmentsService.extract(uid, user);
  }
}
