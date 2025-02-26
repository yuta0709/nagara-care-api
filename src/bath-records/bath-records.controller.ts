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
import { BathRecordsService } from './bath-records.service';
import { BathRecordCreateInputDto } from './dtos/bath-record-create.input.dto';
import { BathRecordUpdateInputDto } from './dtos/bath-record-update.input.dto';
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
import { BathRecordListResponseDto } from './dtos/bath-record-list.output.dto';
import { BathRecordDto } from './dtos/bath-record.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';
import { TranscriptionDto } from './dtos/transcription.output.dto';

@ApiTags('bath-records')
@Controller('residents/:residentUid/bath-records')
export class BathRecordsController {
  constructor(private readonly bathRecordsService: BathRecordsService) {}

  @Get()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getBathRecords',
    summary: '利用者の入浴記録一覧を取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '入浴記録一覧の取得に成功',
    type: BathRecordListResponseDto,
  })
  findByResident(
    @Param('residentUid') residentUid: string,
    @UserDecorator() user: User,
  ): Promise<BathRecordListResponseDto> {
    return this.bathRecordsService.findByResident(residentUid, user);
  }

  @Post()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'createBathRecord',
    summary: '入浴記録を作成',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 201,
    description: '入浴記録の作成に成功',
    type: BathRecordDto,
  })
  create(
    @Param('residentUid') residentUid: string,
    @Body() input: BathRecordCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<BathRecordDto> {
    input.residentUid = residentUid;
    return this.bathRecordsService.create(input, user);
  }

  @Patch(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateBathRecord',
    summary: '入浴記録を更新',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '入浴記録UID' })
  @ApiResponse({
    status: 200,
    description: '入浴記録の更新に成功',
    type: BathRecordDto,
  })
  update(
    @Param('uid') uid: string,
    @Body() input: BathRecordUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<BathRecordDto> {
    return this.bathRecordsService.update(uid, input, user);
  }

  @Delete(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteBathRecord',
    summary: '入浴記録を削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '入浴記録UID' })
  @ApiResponse({
    status: 200,
    description: '入浴記録の削除に成功',
  })
  delete(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.bathRecordsService.delete(uid, user);
  }

  @Get(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getBathRecordTranscription',
    summary: '入浴記録の文字起こしを取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '入浴記録UID' })
  @ApiResponse({
    status: 200,
    description: '入浴記録の文字起こし取得に成功',
    type: TranscriptionDto,
  })
  getTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.bathRecordsService.getTranscription(uid, user);
  }

  @Patch(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'appendBathRecordTranscription',
    summary: '入浴記録の文字起こしを追記',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '入浴記録UID' })
  @ApiResponse({
    status: 200,
    description: '入浴記録の文字起こし追記に成功',
    type: TranscriptionDto,
  })
  appendTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.bathRecordsService.appendTranscription(uid, input, user);
  }

  @Put(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateBathRecordTranscription',
    summary: '入浴記録の文字起こしを置換',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '入浴記録UID' })
  @ApiResponse({
    status: 200,
    description: '入浴記録の文字起こし置換に成功',
    type: TranscriptionDto,
  })
  updateTranscription(
    @Param('uid') uid: string,
    @Body() input: TranscriptionInputDto,
    @UserDecorator() user: User,
  ): Promise<TranscriptionDto> {
    return this.bathRecordsService.updateTranscription(uid, input, user);
  }

  @Delete(':uid/transcription')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteBathRecordTranscription',
    summary: '入浴記録の文字起こしを削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '入浴記録UID' })
  @ApiResponse({
    status: 200,
    description: '入浴記録の文字起こし削除に成功',
  })
  deleteTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.bathRecordsService.deleteTranscription(uid, user);
  }

  @Post(':uid/extract')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'extractBathRecord',
    summary: '入浴記録から情報を抽出',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '入浴記録UID' })
  @ApiResponse({
    status: 200,
    description: '入浴記録からの情報抽出に成功',
    type: String,
  })
  extract(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<string> {
    return this.bathRecordsService.extract(uid, user);
  }
}
