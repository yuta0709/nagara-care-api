import { ApiProperty } from '@nestjs/swagger';
import { ResidentDto } from './resident.output.dto';

export class ResidentListResponseDto {
  @ApiProperty({ type: [ResidentDto] })
  items: ResidentDto[];

  @ApiProperty({ description: '総件数' })
  total: number;
}
