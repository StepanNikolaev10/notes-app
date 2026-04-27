import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { AuthResDto } from './dto/res/auth-res.dto';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GetRefreshTokenPayload } from './decorators/get-rt-payload.decorator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './dto/req/register.dto';
import { LoginDto } from './dto/req/login.dto';
import type { TJwtPayload } from './types/jwt-payload';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/registration')
  async registration(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResDto> {
    const jwts = await this.authService.registration(dto);

    res.cookie('refreshToken', jwts.refreshJwt, {
      httpOnly: true,
      maxAge: this.configService.get<number>('REFRESH_JWT_EXPIRES_IN')! * 1000, // знак ! стоит потому что приложение не запустится без env, стоит Joi schema
    });

    return plainToInstance(AuthResDto, { accessToken: jwts.accessJwt });
  }

  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResDto> {
    const jwts = await this.authService.login(dto);

    res.cookie('refreshToken', jwts.refreshJwt, {
      httpOnly: true,
      maxAge: this.configService.get<number>('REFRESH_JWT_EXPIRES_IN')! * 1000,
    });

    return plainToInstance(AuthResDto, { accessToken: jwts.accessJwt });
  }

  @Post('/refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @GetRefreshTokenPayload() refreshJwtPayload: TJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResDto> {
    const jwts = await this.authService.refresh(refreshJwtPayload);

    if (jwts.refreshJwt) {
      res.cookie('refreshJwt', jwts.refreshJwt, {
        httpOnly: true,
        maxAge:
          this.configService.get<number>('REFRESH_JWT_EXPIRES_IN')! * 1000,
      });
    }

    return plainToInstance(AuthResDto, { accessToken: jwts.accessJwt });
  }
}
