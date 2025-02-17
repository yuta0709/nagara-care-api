import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EliminationRecordsService } from './elimination-records.service';
import { EliminationRecordCreateInputDto } from './dtos/elimination-record-create.input.dto';
import { EliminationRecordUpdateInputDto } from './dtos/elimination-record-update.input.dto';
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
import { EliminationRecordListResponseDto } from './dtos/elimination-record-list.output.dto';
import { EliminationRecordDto } from './dtos/elimination-record.output.dto';

@ApiTags('elimination-records')
@Controller('residents/:residentUid/elimination-records')
export class EliminationRecordsController {
  constructor(
    private readonly eliminationRecordsService: EliminationRecordsService,
  ) {}

  @Get()
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '利用者の排泄記録一覧を取得' })
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
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '排泄記録を作成' })
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
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '排泄記録を更新' })
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
  @Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '排泄記録を削除' })
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
}
