import { UserRole } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  uid: string;
  loginId: string;
  @Exclude()
  passwordDigest: string;
  familyName: string;
  givenName: string;
  familyNameFurigana: string;
  givenNameFurigana: string;
  role: UserRole;
}
