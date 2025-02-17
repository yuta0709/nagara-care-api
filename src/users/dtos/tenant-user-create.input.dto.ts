import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class TenantUserCreateInputDto {
  @ApiProperty({ description: 'ログインID' })
  @IsNotEmpty()
  @IsString()
  loginId: string;

  @ApiProperty({ description: 'パスワード' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: '姓' })
  @IsNotEmpty()
  @IsString()
  familyName: string;

  @ApiProperty({ description: '名' })
  @IsNotEmpty()
  @IsString()
  givenName: string;

  @ApiProperty({ description: '姓（フリガナ）' })
  @IsNotEmpty()
  @IsString()
  familyNameFurigana: string;

  @ApiProperty({ description: '名（フリガナ）' })
  @IsNotEmpty()
  @IsString()
  givenNameFurigana: string;

  @ApiProperty({ description: 'ユーザー権限' })
  @IsEnum(UserRole, {
    message: 'ユーザー権限はTENANT_ADMINかCAREGIVERのみ指定できます',
  })
  role: UserRole;

  tenantUid: string;
}
