import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from '../tokens.service';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(private readonly tokensService: TokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const refreshJwt = req.cookies?.refreshJwt;

      if (!refreshJwt) {
        throw new UnauthorizedException({ message: 'User unauthorized' });
      }

      const verifiedRefreshJwtPayload =
        await this.tokensService.verifyRefreshJwt(refreshJwt);

      req.refreshTokenPayload = verifiedRefreshJwtPayload;

      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException({ message: 'User unauthorized' });
    }
  }
}
