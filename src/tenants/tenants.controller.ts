import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantCreateInputDto } from './dtos/tenant-create.input.dto';

import { Authorize } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { TenantCreateOutputDto } from './dtos/tenant-create.output.dto';

@ApiTags('tenants')
@ApiBearerAuth('JWT-auth')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Authorize([UserRole.GLOBAL_ADMIN])
  @ApiOperation({ summary: 'テナントを作成する' })
  @ApiResponse({
    status: 201,
    description: 'テナントが正常に作成されました',
  })
  async create(@Body() createTenantDto: TenantCreateInputDto) {
    const tenant = await this.tenantsService.create(createTenantDto);
    return plainToClass(TenantCreateOutputDto, tenant);
  }
}
