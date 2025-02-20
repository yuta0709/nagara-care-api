import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  Length,
  IsOptional,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class SubjectUpdateInputDto {
  @ApiProperty({ description: '姓', example: '山田' })
  @IsString()
  @Length(1, 50)
  @IsOptional()
  familyName?: string;

  @ApiProperty({ description: '名', example: '太郎' })
  @IsString()
  @Length(1, 50)
  @IsOptional()
  givenName?: string;

  @ApiProperty({ description: '姓（フリガナ）', example: 'ヤマダ' })
  @IsString()
  @Length(1, 50)
  @IsOptional()
  familyNameFurigana?: string;

  @ApiProperty({ description: '名（フリガナ）', example: 'タロウ' })
  @IsString()
  @Length(1, 50)
  @IsOptional()
  givenNameFurigana?: string;

  @ApiProperty({ description: '生年月日', example: '1950-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: '性別',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;
}
