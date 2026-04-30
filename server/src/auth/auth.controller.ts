import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GetRefreshTokenPayload } from './decorators/get-rt-payload.decorator';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import type { TJwtPayload } from './types/jwt-payload';
import { TokensService } from './tokens.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokensService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/registration')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.register(dto);
    return this.giveJwts({ userId: userData.id }, res);
  }

  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.login(dto);
    return this.giveJwts({ userId: userData.id }, res);
  }

  @Post('/refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @GetRefreshTokenPayload() refreshJwtPayload: TJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.refresh(refreshJwtPayload);
    return this.giveJwts({ userId: userData.id }, res);
  }

  // Private methods
  private async giveJwts(tokenPaylaod: TJwtPayload, res: Response) {
    const jwts = await this.tokenService.generateJwts(tokenPaylaod);

    res.cookie('refreshJwt', jwts.refreshJwt, {
      httpOnly: true,
      maxAge: this.configService.get<number>('REFRESH_JWT_EXPIRES')! * 1000,
    });

    return jwts.accessJwt;
  }
}
