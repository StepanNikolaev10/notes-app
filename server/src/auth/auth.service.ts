import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { TJwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const isUserExists = await this.usersService.getOne({
      email: dto.email,
      username: dto.username,
    });
    if (isUserExists) {
      throw new HttpException(
        'User with this email or username already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(dto.password, 5);

    return this.usersService.createOne(dto.email, dto.username, hashPassword);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.getOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException({
        message: 'User with this email is not exists',
      });
    }

    const passwordEquals = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );
    if (!passwordEquals) {
      throw new UnauthorizedException({ message: 'Invalide password' });
    }

    return user;
  }

  async refresh(refreshJwtPayload: TJwtPayload) {
    const user = await this.usersService.getOne({
      id: refreshJwtPayload.userId,
    });
    if (!user) {
      throw new UnauthorizedException(
        'This account no longer exists. Please log in with a different account.',
      );
    }

    return user;
  }
}
