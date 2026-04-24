import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Tokens } from './types/tokens.interface';
import type { GenerateAccessTokenArgs, GenerateRefreshTokenArgs, VerifyAccessTokenArgs, VerifyRefreshTokenArgs } from './types/services/tokens-service-args.types';
import type { GenerateAccessTokenResult, GenerateRefreshTokenResult, VerifyAccessTokenResult, VerifyRefreshTokenResult } from './types/services/tokens-service-results.types';

@Injectable()
export class TokensService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async generateAccessToken(args: GenerateAccessTokenArgs): Promise<GenerateAccessTokenResult> {
    const payload: Tokens['accessTokenPayload'] = {
      userId: args.userId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRES_IN'),
    });

    return accessToken;
  }

  async generateRefreshToken(args: GenerateRefreshTokenArgs): Promise<GenerateRefreshTokenResult> {
    const payload: Tokens['refreshTokenPayload'] = {
      userId: args.userId,
      sessionId: args.newSessionId
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN'),
    });

    return refreshToken;
  }

  async verifyAccessToken(token: VerifyAccessTokenArgs): Promise<VerifyAccessTokenResult> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET')
    });
  }

  async verifyRefreshToken(token: VerifyRefreshTokenArgs): Promise<VerifyRefreshTokenResult> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')
    });
  }

}
