import { UserRole } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class MeResponseDto {
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
