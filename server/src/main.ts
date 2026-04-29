import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Отрезает всё, что не описано в DTO
      forbidNonWhitelisted: true, // Вместо отрезания выбрасывает ошибку 400
      transform: true, // Превращает типы (строки в числа и т.д.)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
