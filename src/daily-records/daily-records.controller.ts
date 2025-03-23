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
import { DailyRecordsService } from './daily-records.service';
import { DailyRecordCreateInputDto } from './dtos/daily-record-create.input.dto';
import { DailyRecordUpdateInputDto } from './dtos/daily-record-update.input.dto';
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
import { DailyRecordListResponseDto } from './dtos/daily-record-list.output.dto';
import { DailyRecordDto } from './dtos/daily-record.output.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { DailyRecordExtractedDto } from './dtos/daily-record-extracted.output.dto';

@ApiTags('daily-records')
@Controller('residents/:residentUid/daily-records')
export class DailyRecordsController {
  constructor(private readonly dailyRecordsService: DailyRecordsService) {}

  @Get()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getDailyRecords',
    summary: '利用者の日常記録一覧を取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録一覧の取得に成功',
    type: DailyRecordListResponseDto,
  })
  findByResident(
    @Param('residentUid') residentUid: string,
    @UserDecorator() user: User,
  ): Promise<DailyRecordListResponseDto> {
    return this.dailyRecordsService.findByResident(residentUid, user);
  }

  @Get(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getDailyRecord',
    summary: '個別の日常記録を取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '日常記録UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録の取得に成功',
    type: DailyRecordDto,
  })
  findOne(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<DailyRecordDto> {
    return this.dailyRecordsService.findOne(uid, user);
  }

  @Post()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'createDailyRecord',
    summary: '日常記録を作成',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 201,
    description: '日常記録の作成に成功',
    type: DailyRecordDto,
  })
  create(
    @Param('residentUid') residentUid: string,
    @Body() input: DailyRecordCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<DailyRecordDto> {
    input.residentUid = residentUid;
    return this.dailyRecordsService.create(input, user);
  }

  @Patch(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateDailyRecord',
    summary: '日常記録を更新',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '日常記録UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録の更新に成功',
    type: DailyRecordDto,
  })
  update(
    @Param('uid') uid: string,
    @Body() input: DailyRecordUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<DailyRecordDto> {
    return this.dailyRecordsService.update(uid, input, user);
  }

  @Delete(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteDailyRecord',
    summary: '日常記録を削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '日常記録UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録の削除に成功',
  })
  delete(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.dailyRecordsService.delete(uid, user);
  }

  @Get(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getDailyRecordTranscription',
    summary: '日常記録の文字起こしを取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '日常記録UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録の文字起こし取得に成功',
    type: TranscriptionDto,
  })
  getTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.dailyRecordsService.getTranscription(uid, user);
  }

  @Patch(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'appendDailyRecordTranscription',
    summary: '日常記録の文字起こしを追記',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '日常記録UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録の文字起こし追記に成功',
    type: TranscriptionDto,
  })
  appendTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.dailyRecordsService.appendTranscription(uid, input, user);
  }

  @Put(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateDailyRecordTranscription',
    summary: '日常記録の文字起こしを置換',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '日常記録UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録の文字起こし置換に成功',
    type: TranscriptionDto,
  })
  updateTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.dailyRecordsService.updateTranscription(uid, input, user);
  }

  @Delete(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteDailyRecordTranscription',
    summary: '日常記録の文字起こしを削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '日常記録UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録の文字起こし削除に成功',
  })
  deleteTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.dailyRecordsService.deleteTranscription(uid, user);
  }

  @Get(':uid/extract')
  @Authorize([UserRole.CAREGIVER, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'extractDailyRecord',
    summary: '日常記録を抽出',
  })
  @ApiParam({ name: 'uid', description: '日常記録UID' })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '日常記録の抽出に成功',
    type: DailyRecordExtractedDto,
  })
  extract(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<DailyRecordExtractedDto> {
    return this.dailyRecordsService.extractDailyRecord(uid, user);
  }
}
