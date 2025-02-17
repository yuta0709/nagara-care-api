import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Expose } from 'class-transformer';

export class UserListItemDto {
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
  @ApiProperty({ description: 'ロール', enum: UserRole })
  role: UserRole;

  @Expose()
  @ApiProperty({ description: '作成日時' })
  createdAt: Date;
}

export class UserListResponseDto {
  @Expose()
  @ApiProperty({ description: 'ユーザー一覧', type: [UserListItemDto] })
  items: UserListItemDto[];

  @Expose()
  @ApiProperty({ description: '総件数' })
  total: number;
}
