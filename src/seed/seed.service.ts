import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    try {
      await this.seed();
    } catch (error) {
      this.logger.error('シードの実行中にエラーが発生しました:', error);
    }
  }

  private async seed() {
    this.logger.log('シードの実行を開始します...');

    await this.seedGlobalAdmin();

    this.logger.log('シードの実行が完了しました');
  }

  private async seedGlobalAdmin() {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORDが環境変数に設定されていません');
    }

    await this.usersService.createOrUpdateGlobalAdmin({
      loginId: 'global-admin1',
      password: adminPassword,
      familyName: '管理者',
      givenName: '1',
      familyNameFurigana: 'かんりしゃ',
      givenNameFurigana: 'いち',
    });

    this.logger.log('グローバル管理者の作成が完了しました');
  }
}
