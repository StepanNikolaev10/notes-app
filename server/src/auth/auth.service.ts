import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { RegisterDto } from './dto/req/register.dto';
import { LoginDto } from './dto/req/login.dto';
import { TJwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  async registration(dto: RegisterDto) {
    const candidate = await this.usersService.getOne(dto.email);
    if (candidate) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(dto.password, 5);
    const user = await this.usersService.createOne(
      dto.email,
      dto.username,
      hashPassword,
    );

    return this.tokensService.generateJwts({ userId: user.id });
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    return this.tokensService.generateJwts({ userId: user.id });
  }

  async refresh(refreshJwtPayload: TJwtPayload) {
    const isUserExists = await this.usersService.getOne(
      refreshJwtPayload.userId,
    );
    if (!isUserExists) {
      throw new UnauthorizedException(
        'This account no longer exists. Please log in with a different account.',
      );
    }

    return await this.tokensService.generateJwts({
      userId: refreshJwtPayload.userId,
    });
  }

  private async validateUser(dto: LoginDto) {
    const user = await this.usersService.getOne(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        message: 'User with this email is not exists',
      });
    }
    const passwordEquals = await bcrypt.compare(dto.password, dto.password);
    if (!passwordEquals) {
      throw new UnauthorizedException({ message: 'Invalide password' });
    }
    return user;
  }
}
