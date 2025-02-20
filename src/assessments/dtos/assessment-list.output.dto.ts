import { ApiProperty } from '@nestjs/swagger';
import { AssessmentDto } from './assessment.output.dto';

export class AssessmentListResponseDto {
  @ApiProperty({ description: 'アセスメント一覧', type: [AssessmentDto] })
  items: AssessmentDto[];

  @ApiProperty({ description: '総件数' })
  total: number;
}
