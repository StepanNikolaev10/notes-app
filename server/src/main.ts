import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Notes app backend')
    .setDescription('Some description')
    .setVersion('1.0')
    .addTag('notes')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
