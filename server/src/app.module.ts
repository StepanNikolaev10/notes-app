import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ACCESS_JWT_SECRET: Joi.string().required(),
        REFRESH_JWT_SECRET: Joi.string().required(),
        ACCESS_JWT_EXPIRES: Joi.number().required(),
        REFRESH_JWT_EXPIRES: Joi.number().required(),
        POSTGRES_PORT: Joi.number().port().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
      }),
    }),
    UsersModule,
    AuthModule,
    NotesModule,
    PrismaModule,
  ],
})
export class AppModule {}
