import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GetRefreshTokenPayload } from './decorators/get-rt-payload.decorator';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import type { TJwtPayload } from './types/jwt-payload';
import { TokensService } from './tokens/tokens.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokensService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Регистрация в системе' })
  @Post('/registration')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.register(dto);
    return this.giveJwts({ userId: userData.id }, res);
  }

  @ApiOperation({ summary: 'Вход в систему' })
  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.login(dto);
    return this.giveJwts({ userId: userData.id }, res);
  }

  @ApiOperation({ summary: 'Выход из системы' })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('refreshJwt', '');
  }

  @ApiOperation({ summary: 'Обновление токенов авторизации' })
  @Post('/refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @GetRefreshTokenPayload() refreshJwtPayload: TJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.refresh(refreshJwtPayload);
    return this.giveJwts({ userId: userData.id }, res);
  }

  private async giveJwts(tokenPaylaod: TJwtPayload, res: Response) {
    const jwts = await this.tokenService.generateJwts(tokenPaylaod);

    res.cookie('refreshJwt', jwts.refreshJwt, {
      httpOnly: true,
      maxAge: this.configService.get<number>('REFRESH_JWT_EXPIRES')! * 1000,
    });

    return jwts.accessJwt;
  }
}
