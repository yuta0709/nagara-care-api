import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ExtractedQaPair {
  @ApiProperty({ type: String })
  question: string;

  @ApiProperty({ type: String })
  @IsOptional()
  answer: string;
}

export class ExtractQaPairsOutputDto {
  @ApiProperty({ type: [ExtractedQaPair] })
  data: ExtractedQaPair[];
}
