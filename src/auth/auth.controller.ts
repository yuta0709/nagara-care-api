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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() body: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(body.loginId, body.password);
  }

  @Authorize()
  @Get('me')
  getProfile(@User() user: PrismaUser): MeResponseDto {
    return plainToInstance(MeResponseDto, user);
  }
}
