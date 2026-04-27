import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';

@Module({
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([UserEntity])], // forFeature([Entity]) делает только одну вещь: он создает Repository для этой сущности ...
  // ... и делает его доступным для внедрения (Dependency Injection) в этом модуле.
  exports: [UsersService],
})
export class UsersModule {}
