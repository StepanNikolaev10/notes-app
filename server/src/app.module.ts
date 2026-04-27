import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({ // config module это динамический модуль который надо настроить, 
    // ... root говорит о том, что конфигурация, которую мы передаём ...
    // ...будет существовать в единственном экземпляре (Singleton) на уровне всего приложения.
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.number().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.number().required(),
        POSTGRES_PORT: Joi.number().port().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_DB_NAME: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({ // изспользует forRootAsync потому что надо дождаться загрузки ConfigModule 
      inject: [ConfigService], // inject позволяет внедрить зависимость которую мы будет ожидать ...
      // Плюсы ConfigService над простым взятием через process.env:
      // 1. Безопасность: ConfigService гарантирует, что данные уже ЗАГРУЖЕНЫ и провалидированы(Joi).
      // 2. Типизация: Можно явно указать тип .get<number>(...), избегая ручного приведения строк.
      // 3. Тесты: Позволяет легко подменять настройки в тестах, не трогая системные переменные.
      useFactory: (configService: ConfigService) => ({ // с помощью use factory и ConfigService мы коллбеком передаём значения из configModule в TypeOrmModule
        type: 'postgres',
        port: configService.get<number>('POSTGRES_PORT'),
        host: configService.get<string>('POSTGRES_HOST'),
        database: configService.get<string>('POSTGRES_DB'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        autoLoadEntities: true, // автоматически собирает все сущности зареганые через forFeature
        synchronize: true, 
      }),
    }),
    UsersModule,
    AuthModule,
    NotesModule,
    PrismaModule
  ] 
})
export class AppModule {}
