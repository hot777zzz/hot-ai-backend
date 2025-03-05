import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 添加 CORS 配置
  app.enableCors({
    origin: 'http://localhost:3001', // 前端应用的地址
    credentials: true, // 允许携带凭证
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
