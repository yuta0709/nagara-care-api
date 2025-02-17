import { ForbiddenException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dtos/token.output.dto';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  // ログインIDとパスワードからJWTトークンを発行
  async signIn(loginId: string, password: string): Promise<TokenDto> {
    const user = await this.prismaService.user.findUnique({
      where: { loginId },
    });

    if (!user) {
      throw new ForbiddenException();
    }

    const isPasswordValid = await compare(password, user.passwordDigest);
    if (!isPasswordValid) {
      throw new ForbiddenException();
    }
    const payload = { sub: user.uid };
    const token = await this.jwtService.signAsync(payload);

    return plainToInstance(TokenDto, { token });
  }
}
