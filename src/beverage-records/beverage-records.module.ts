import { Module } from '@nestjs/common';
import { BeverageRecordsService } from './beverage-records.service';
import { BeverageRecordsController } from './beverage-records.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BeverageRecordsController],
  providers: [BeverageRecordsService],
})
export class BeverageRecordsModule {}
