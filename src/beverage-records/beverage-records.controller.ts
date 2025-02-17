import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('beverage-records')
@Controller('residents/:residentUid/beverage-records')
export class BeverageRecordsController {
  constructor(
    private readonly beverageRecordsService: BeverageRecordsService,
  ) {}

  @Get()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '利用者の飲料記録一覧を取得' })
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
  @ApiOperation({ summary: '飲料記録を作成' })
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
  @ApiOperation({ summary: '飲料記録を更新' })
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
  @ApiOperation({ summary: '飲料記録を削除' })
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
}
