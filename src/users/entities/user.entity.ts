export class User {
  uid: string;
  loginId: string;
  passwordDigest: string;
  familyName: string;
  givenName: string;
  familyNameFurigana: string;
  givenNameFurigana: string;
  role: UserRole;
}

export enum UserRole {
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  CAREGIVER = 'CAREGIVER',
}
