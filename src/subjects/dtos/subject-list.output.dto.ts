import { ApiProperty } from '@nestjs/swagger';
import { SubjectDto } from './subject.output.dto';

export class SubjectListResponseDto {
  @ApiProperty({ description: 'アセスメント対象者一覧', type: [SubjectDto] })
  items: SubjectDto[];

  @ApiProperty({ description: '総件数' })
  total: number;
}
