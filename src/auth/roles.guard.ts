import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { Request } from 'express';

// メタデータキー
const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. トークンの取得と検証
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('認証トークンが見つかりません');
    }

    try {
      // 2. JWTの検証とユーザー情報の取得
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prismaService.user.findUnique({
        where: { uid: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('ユーザーが見つかりません');
      }
      request['user'] = user;

      // 3. ロールの検証
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      // ロールが設定されていない場合は認証のみで許可
      if (!requiredRoles) {
        return true;
      }

      // ロールの検証
      if (!requiredRoles.includes(user.role)) {
        throw new UnauthorizedException(
          'このアクションを実行する権限がありません',
        );
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('認証に失敗しました');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

/**
 * 認証と認可を行うデコレータ
 * @param roles 許可するロールの配列（省略時は認証のみ）
 * @returns デコレータ関数
 *
 * 使用例：
 * // クラス全体に適用（すべてのエンドポイントで介護士とテナント管理者のみアクセス可能）
 * @Authorize([UserRole.CAREGIVER, UserRole.TENANT_ADMIN])
 * export class CaregiverController {}
 *
 * // 特定のエンドポイントのみに適用（グローバル管理者のみアクセス可能）
 * @Authorize([UserRole.GLOBAL_ADMIN])
 * @Get('admin-settings')
 * getAdminSettings() {}
 *
 * // 認証のみ必要な場合
 * @Authorize()
 * @Get('profile')
 * getProfile() {}
 */
export function Authorize(roles?: UserRole[]) {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard));
}
