import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function main() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const usersService = appContext.get(UsersService);
  const globalAdmin = await usersService.createOrUpdateGlobalAdmin({
    loginId: 'global-admin1',
    password: process.env.ADMIN_PASSWORD,
    familyName: '管理者',
    givenName: '1',
    familyNameFurigana: 'かんりしゃ',
    givenNameFurigana: 'いち',
  });
  console.log(globalAdmin);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
