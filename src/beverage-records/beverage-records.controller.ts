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
import { BeverageRecordsService } from './beverage-records.service';
import { BeverageRecordCreateInputDto } from './dtos/beverage-record-create.input.dto';
import { BeverageRecordUpdateInputDto } from './dtos/beverage-record-update.input.dto';
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
import { BeverageRecordListResponseDto } from './dtos/beverage-record-list.output.dto';
import { BeverageRecordDto } from './dtos/beverage-record.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';
import { BeverageRecordExtractedDto } from './dtos/beverage-record-extracted.output.dto';

@ApiTags('beverage-records')
@Controller('residents/:residentUid/beverage-records')
export class BeverageRecordsController {
  constructor(
    private readonly beverageRecordsService: BeverageRecordsService,
  ) {}

  @Get()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getBeverageRecords',
    summary: '利用者の飲料記録一覧を取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '飲料記録一覧の取得に成功',
    type: BeverageRecordListResponseDto,
  })
  findByResident(
    @Param('residentUid') residentUid: string,
    @UserDecorator() user: User,
  ): Promise<BeverageRecordListResponseDto> {
    return this.beverageRecordsService.findByResident(residentUid, user);
  }

  @Post()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'createBeverageRecord',
    summary: '飲料記録を作成',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 201,
    description: '飲料記録の作成に成功',
    type: BeverageRecordDto,
  })
  create(
    @Param('residentUid') residentUid: string,
    @Body() input: BeverageRecordCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<BeverageRecordDto> {
    input.residentUid = residentUid;
    return this.beverageRecordsService.create(input, user);
  }

  @Patch(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateBeverageRecord',
    summary: '飲料記録を更新',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '飲料記録UID' })
  @ApiResponse({
    status: 200,
    description: '飲料記録の更新に成功',
    type: BeverageRecordDto,
  })
  update(
    @Param('uid') uid: string,
    @Body() input: BeverageRecordUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<BeverageRecordDto> {
    return this.beverageRecordsService.update(uid, input, user);
  }

  @Delete(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteBeverageRecord',
    summary: '飲料記録を削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '飲料記録UID' })
  @ApiResponse({
    status: 200,
    description: '飲料記録の削除に成功',
  })
  delete(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.beverageRecordsService.delete(uid, user);
  }

  @Get(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getBeverageRecordTranscription',
    summary: '飲料記録の文字起こしを取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '飲料記録UID' })
  @ApiResponse({
    status: 200,
    description: '飲料記録の文字起こし取得に成功',
    type: TranscriptionDto,
  })
  getTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.beverageRecordsService.getTranscription(uid, user);
  }

  @Patch(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'appendBeverageRecordTranscription',
    summary: '飲料記録の文字起こしを追記',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '飲料記録UID' })
  @ApiResponse({
    status: 200,
    description: '飲料記録の文字起こし追記に成功',
    type: TranscriptionDto,
  })
  appendTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.beverageRecordsService.appendTranscription(uid, input, user);
  }

  @Put(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateBeverageRecordTranscription',
    summary: '飲料記録の文字起こしを置換',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '飲料記録UID' })
  @ApiResponse({
    status: 200,
    description: '飲料記録の文字起こし置換に成功',
    type: TranscriptionDto,
  })
  updateTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.beverageRecordsService.updateTranscription(uid, input, user);
  }

  @Delete(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteBeverageRecordTranscription',
    summary: '飲料記録の文字起こしを削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '飲料記録UID' })
  @ApiResponse({
    status: 200,
    description: '飲料記録の文字起こし削除に成功',
  })
  deleteTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.beverageRecordsService.deleteTranscription(uid, user);
  }

  @Post(':uid/extract')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'extractBeverageRecord',
    summary: '飲み物摂取記録から情報を抽出',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '飲み物摂取記録UID' })
  @ApiResponse({
    status: 200,
    description: '飲み物摂取記録の情報抽出に成功',
    type: BeverageRecordExtractedDto,
  })
  extract(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<BeverageRecordExtractedDto> {
    return this.beverageRecordsService.extract(uid, user);
  }
}
