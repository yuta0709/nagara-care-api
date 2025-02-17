import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SignInDto } from './dtos/signin.input.dto';
import { AuthService } from './auth.service';
import { TokenDto } from './dtos/token.output.dto';
import { User } from 'src/users/user.decorator';
import { User as PrismaUser } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { Authorize } from './roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from '../users/dtos/user.output.dto';

// 認証関連のコントローラー
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ログインIDとパスワードからJWTトークンを発行
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'ログイン' })
  @ApiResponse({
    status: 200,
    description: 'ログイン成功',
    type: TokenDto,
  })
  async signIn(@Body() body: SignInDto): Promise<TokenDto> {
    return this.authService.signIn(body.loginId, body.password);
  }

  // ログイン中のユーザー情報を取得。Bearerトークンからユーザー情報を取得
  @Authorize()
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ログイン中のユーザー情報を取得' })
  @ApiResponse({
    status: 200,
    description: 'ユーザー情報の取得に成功',
    type: UserDto,
  })
  getProfile(@User() user: PrismaUser): UserDto {
    return plainToInstance(UserDto, user);
  }
}
