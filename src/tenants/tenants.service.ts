import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantCreateInputDto } from './dtos/tenant-create.input.dto';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(data: TenantCreateInputDto): Promise<Tenant> {
    return this.prisma.tenant.create({
      data: {
        name: data.name,
      },
    });
  }
}
