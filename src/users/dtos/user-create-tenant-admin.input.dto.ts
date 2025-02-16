import { IsNotEmpty, IsString } from 'class-validator';

export class UserCreateTenantAdmin {
  @IsNotEmpty()
  @IsString()
  loginId: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  familyName: string;

  @IsNotEmpty()
  @IsString()
  givenName: string;

  @IsNotEmpty()
  @IsString()
  familyNameFurigana: string;

  @IsNotEmpty()
  @IsString()
  givenNameFurigana: string;

  @IsNotEmpty()
  @IsString()
  tenantUid: string;
}
