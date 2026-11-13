import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UPLOAD_DIR } from './uploads/uploads.controller.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.useStaticAssets(UPLOAD_DIR, { prefix: '/uploads' });
  // FRONTEND_URL: một hoặc nhiều origin, phân tách bằng dấu phẩy. Bỏ dấu "/" cuối để khớp header Origin.
  const origins = [
    'http://localhost:3000',
    'https://tennis-gules-three.vercel.app',
    ...(process.env.FRONTEND_URL ?? '').split(','),
  ]
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  app.enableCors({ origin: [...new Set(origins)] });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Tennis Shop API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
