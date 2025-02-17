import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Expose } from 'class-transformer';

export class ResidentDto {
  @Expose()
  @ApiProperty({ description: 'UID' })
  uid: string;

  @Expose()
  @ApiProperty({ description: 'テナントUID' })
  tenantUid: string;

  @Expose()
  @ApiProperty({ description: '姓' })
  familyName: string;

  @Expose()
  @ApiProperty({ description: '名' })
  givenName: string;

  @Expose()
  @ApiProperty({ description: '姓（フリガナ）' })
  familyNameFurigana: string;

  @Expose()
  @ApiProperty({ description: '名（フリガナ）' })
  givenNameFurigana: string;

  @Expose()
  @ApiProperty({ description: '生年月日' })
  dateOfBirth: Date;

  @Expose()
  @ApiProperty({ description: '性別', enum: Gender })
  gender: Gender;

  @Expose()
  @ApiProperty({ description: '入所日' })
  admissionDate: Date;

  @Expose()
  @ApiProperty({ description: '作成日時' })
  createdAt: Date;
}
