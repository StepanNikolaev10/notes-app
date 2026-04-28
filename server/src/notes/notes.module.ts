import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { UserEntity } from 'src/users/user.entity';
import { NoteEntity } from './note.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [NotesController],
  providers: [NotesService],
  imports: [AuthModule, PrismaModule],
})
export class NotesModule {}
