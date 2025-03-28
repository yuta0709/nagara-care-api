import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { PrismaNotFoundExceptionFilter } from './common/filters/prisma-not-found-exception.filter';

async function writeOpenAPISpec(app: any) {
  const config = new DocumentBuilder()
    .setTitle('Nagara Care API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const yamlString = yaml.stringify(document);
  fs.writeFileSync('./openapi.yaml', yamlString);
  return document;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORSを有効化
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*', // 環境変数から許可するオリジンを設定、未設定の場合は全てのオリジンを許可
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    credentials: true, // クッキーやHTTP認証を含むリクエストを許可
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new PrismaNotFoundExceptionFilter());

  const document = await writeOpenAPISpec(app);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
