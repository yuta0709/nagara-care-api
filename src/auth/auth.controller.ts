import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SignInDto } from './dtos/signin.dto';
import { AuthService } from './auth.service';
import { SignInResponseDto } from './dtos/signin-response.dto';
import { User } from 'src/users/user.decorator';
import { User as PrismaUser } from '@prisma/client';
import { MeResponseDto } from './dtos/me-response.dto';
import { plainToInstance } from 'class-transformer';
import { Authorize } from './roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'ログイン' })
  @ApiResponse({
    status: 200,
    description: 'ログイン成功',
    type: SignInResponseDto,
  })
  signIn(@Body() body: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(body.loginId, body.password);
  }

  @Authorize()
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ログイン中のユーザー情報を取得' })
  @ApiResponse({
    status: 200,
    description: 'ユーザー情報の取得に成功',
    type: MeResponseDto,
  })
  getProfile(@User() user: PrismaUser): MeResponseDto {
    return plainToInstance(MeResponseDto, user);
  }
}
