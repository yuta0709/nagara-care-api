import { ForbiddenException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(loginId: string, password: string) {
    const user = await this.usersService.findOneByLoginId(loginId);

    const isPasswordValid = await compare(password, user.passwordDigest);
    if (!isPasswordValid) {
      throw new ForbiddenException();
    }
    const payload = { sub: user.uid };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
