import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Length, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UserUpdateInputDto {
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

  @ApiProperty({
    description: 'ユーザーロール',
    enum: UserRole,
    example: UserRole.CAREGIVER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
