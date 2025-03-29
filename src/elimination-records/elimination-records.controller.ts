import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EliminationRecordsService } from './elimination-records.service';
import { EliminationRecordCreateInputDto } from './dtos/elimination-record-create.input.dto';
import { EliminationRecordUpdateInputDto } from './dtos/elimination-record-update.input.dto';
import { Authorize } from '../auth/roles.guard';
import { UserRole, User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { User as UserDecorator } from '../users/user.decorator';
import { EliminationRecordListResponseDto } from './dtos/elimination-record-list.output.dto';
import { EliminationRecordDto } from './dtos/elimination-record.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { EliminationRecordExtractedDto } from './dtos/elimination-record-extracted.output.dto';

@Authorize([UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
@ApiBearerAuth('JWT-auth')
@ApiTags('elimination-records')
@Controller('residents/:residentUid/elimination-records')
export class EliminationRecordsController {
  constructor(
    private readonly eliminationRecordsService: EliminationRecordsService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'getEliminationRecords',
    summary: '利用者の排泄記録一覧を取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '排泄記録一覧の取得に成功',
    type: EliminationRecordListResponseDto,
  })
  findByResident(
    @Param('residentUid') residentUid: string,
    @UserDecorator() user: User,
  ): Promise<EliminationRecordListResponseDto> {
    return this.eliminationRecordsService.findByResident(residentUid, user);
  }

  @Post()
  @ApiOperation({
    operationId: 'createEliminationRecord',
    summary: '排泄記録を作成',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 201,
    description: '排泄記録の作成に成功',
    type: EliminationRecordDto,
  })
  create(
    @Param('residentUid') residentUid: string,
    @Body() input: EliminationRecordCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<EliminationRecordDto> {
    input.residentUid = residentUid;
    return this.eliminationRecordsService.create(input, user);
  }

  @Patch(':uid')
  @ApiOperation({
    operationId: 'updateEliminationRecord',
    summary: '排泄記録を更新',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '排泄記録UID' })
  @ApiResponse({
    status: 200,
    description: '排泄記録の更新に成功',
    type: EliminationRecordDto,
  })
  update(
    @Param('uid') uid: string,
    @Body() input: EliminationRecordUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<EliminationRecordDto> {
    return this.eliminationRecordsService.update(uid, input, user);
  }

  @Delete(':uid')
  @ApiOperation({
    operationId: 'deleteEliminationRecord',
    summary: '排泄記録を削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '排泄記録UID' })
  @ApiResponse({
    status: 200,
    description: '排泄記録の削除に成功',
  })
  delete(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.eliminationRecordsService.delete(uid, user);
  }

  @Get(':uid/transcription')
  @ApiOperation({
    operationId: 'getEliminationRecordTranscription',
    summary: '排泄記録の文字起こしを取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '排泄記録UID' })
  @ApiResponse({
    status: 200,
    description: '排泄記録の文字起こし取得に成功',
    type: TranscriptionDto,
  })
  getTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.eliminationRecordsService.getTranscription(uid, user);
  }

  @Patch(':uid/transcription')
  @ApiOperation({
    operationId: 'appendEliminationRecordTranscription',
    summary: '排泄記録の文字起こしを追記',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '排泄記録UID' })
  @ApiResponse({
    status: 200,
    description: '排泄記録の文字起こし追記に成功',
    type: TranscriptionDto,
  })
  appendTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.eliminationRecordsService.appendTranscription(uid, input, user);
  }

  @Put(':uid/transcription')
  @ApiOperation({
    operationId: 'updateEliminationRecordTranscription',
    summary: '排泄記録の文字起こしを置換',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '排泄記録UID' })
  @ApiResponse({
    status: 200,
    description: '排泄記録の文字起こし置換に成功',
    type: TranscriptionDto,
  })
  updateTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.eliminationRecordsService.updateTranscription(uid, input, user);
  }

  @Delete(':uid/transcription')
  @ApiOperation({
    operationId: 'deleteEliminationRecordTranscription',
    summary: '排泄記録の文字起こしを削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '排泄記録UID' })
  @ApiResponse({
    status: 200,
    description: '排泄記録の文字起こし削除に成功',
  })
  deleteTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.eliminationRecordsService.deleteTranscription(uid, user);
  }

  @Post(':uid/extract')
  @ApiOperation({
    operationId: 'extractEliminationRecord',
    summary: '排泄記録から情報を抽出',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '排泄記録UID' })
  @ApiResponse({
    status: 200,
    description: '排泄記録からの情報抽出に成功',
    type: EliminationRecordExtractedDto,
  })
  extract(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<EliminationRecordExtractedDto> {
    return this.eliminationRecordsService.extract(uid, user);
  }
}
