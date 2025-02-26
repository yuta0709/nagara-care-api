import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FoodRecordsService } from './food-records.service';
import { FoodRecordCreateInputDto } from './dtos/food-record-create.input.dto';
import { FoodRecordUpdateInputDto } from './dtos/food-record-update.input.dto';
import { Authorize } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { User as UserDecorator } from '../users/user.decorator';
import { User } from '@prisma/client';
import { FoodRecordListResponseDto } from './dtos/food-record-list.output.dto';
import { FoodRecordDto } from './dtos/food-record.output.dto';
import { DailyFoodRecordsListResponseDto } from './dtos/food-record-daily.output.dto';

@ApiTags('food-records')
@Controller('residents/:residentUid/food-records')
export class FoodRecordsController {
  constructor(private readonly foodRecordsService: FoodRecordsService) {}

  @Get()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getFoodRecords',
    summary: '利用者の食事記録一覧を取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 200,
    description: '食事記録一覧の取得に成功',
    type: FoodRecordListResponseDto,
  })
  findByResident(
    @Param('residentUid') residentUid: string,
    @UserDecorator() user: User,
  ): Promise<FoodRecordListResponseDto> {
    return this.foodRecordsService.findByResident(residentUid, user);
  }

  @Get('daily')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'getDailyFoodRecords',
    summary: '利用者の日別食事記録一覧を取得',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '開始日（YYYY-MM-DD形式）。指定しない場合は過去30日間',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '終了日（YYYY-MM-DD形式）。指定しない場合は現在日',
  })
  @ApiResponse({
    status: 200,
    description: '日別食事記録一覧の取得に成功',
    type: DailyFoodRecordsListResponseDto,
  })
  findDailyRecords(
    @Param('residentUid') residentUid: string,
    @UserDecorator() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DailyFoodRecordsListResponseDto> {
    return this.foodRecordsService.findDailyRecordsByResident(
      residentUid,
      user,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'createFoodRecord',
    summary: '食事記録を作成',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiResponse({
    status: 201,
    description: '食事記録の作成に成功',
    type: FoodRecordDto,
  })
  create(
    @Param('residentUid') residentUid: string,
    @Body() input: FoodRecordCreateInputDto,
    @UserDecorator() user: User,
  ): Promise<FoodRecordDto> {
    input.residentUid = residentUid;
    return this.foodRecordsService.create(input, user);
  }

  @Patch(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'updateFoodRecord',
    summary: '食事記録を更新',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '食事記録UID' })
  @ApiResponse({
    status: 200,
    description: '食事記録の更新に成功',
    type: FoodRecordDto,
  })
  update(
    @Param('uid') uid: string,
    @Body() input: FoodRecordUpdateInputDto,
    @UserDecorator() user: User,
  ): Promise<FoodRecordDto> {
    return this.foodRecordsService.update(uid, input, user);
  }

  @Delete(':uid')
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    operationId: 'deleteFoodRecord',
    summary: '食事記録を削除',
  })
  @ApiParam({ name: 'residentUid', description: '利用者UID' })
  @ApiParam({ name: 'uid', description: '食事記録UID' })
  @ApiResponse({
    status: 200,
    description: '食事記録の削除に成功',
  })
  delete(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ): Promise<void> {
    return this.foodRecordsService.delete(uid, user);
  }
}
