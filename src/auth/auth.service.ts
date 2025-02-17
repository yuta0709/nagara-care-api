import { ForbiddenException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInResponseDto } from './dtos/signin-response.dto';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(loginId: string, password: string): Promise<SignInResponseDto> {
    const user = await this.usersService.findOneByLoginId(loginId);

    if (!user) {
      throw new ForbiddenException();
    }

    const isPasswordValid = await compare(password, user.passwordDigest);
    if (!isPasswordValid) {
      throw new ForbiddenException();
    }
    const payload = { sub: user.uid };

    return plainToInstance(SignInResponseDto, {
      token: await this.jwtService.signAsync(payload),
    });
  }
}
