import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Gender } from '@prisma/client';

export class SubjectDto {
  @ApiProperty({ description: 'UID' })
  @Expose()
  uid: string;

  @ApiProperty({ description: '姓' })
  @Expose()
  familyName: string;

  @ApiProperty({ description: '名' })
  @Expose()
  givenName: string;

  @ApiProperty({ description: '姓（フリガナ）' })
  @Expose()
  familyNameFurigana: string;

  @ApiProperty({ description: '名（フリガナ）' })
  @Expose()
  givenNameFurigana: string;

  @ApiProperty({ description: '生年月日' })
  @Expose()
  dateOfBirth: Date;

  @ApiProperty({ description: '性別', enum: Gender })
  @Expose()
  gender: Gender;

  @ApiProperty({ description: '作成日時' })
  @Expose()
  createdAt: Date;
}
