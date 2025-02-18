import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  @ApiProperty({ description: 'ユーザーUID' })
  uid: string;

  @Expose()
  @ApiProperty({ description: 'ログインID' })
  loginId: string;

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
  @ApiProperty({ description: 'ユーザー権限' })
  role: UserRole;

  @Expose()
  @ApiProperty({ description: 'テナントUID' })
  tenantUid: string;
}
