import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TJwtPayload } from './types/jwt-payload';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateJwts(payload: TJwtPayload) {
    const accessJwt = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('ACCESS_JWT_SECRET'),
      expiresIn: this.configService.get<number>('ACCESS_JWT_EXPIRES'),
    });

    const refreshJwt = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      expiresIn: this.configService.get<number>('REFRESH_JWT_EXPIRES'),
    });

    return { accessJwt, refreshJwt };
  }

  async verifyAccessJwt(token: string) {
    return await this.jwtService.verifyAsync<TJwtPayload>(token, {
      secret: this.configService.get<string>('ACCESS_JWT_SECRET'),
    });
  }

  async verifyRefreshJwt(token: string) {
    return await this.jwtService.verifyAsync<TJwtPayload>(token, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
    });
  }
}
