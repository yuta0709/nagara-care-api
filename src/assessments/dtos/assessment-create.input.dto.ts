import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssessmentCreateInputDto {
  @ApiProperty({ description: 'アセスメント対象者UID' })
  @IsString()
  subjectUid: string;

  // テナントUIDはコントローラーで設定
  tenantUid?: string;
}
