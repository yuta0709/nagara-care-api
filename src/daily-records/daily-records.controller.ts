import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
}
