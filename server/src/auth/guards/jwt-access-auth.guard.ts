import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from '../tokens.service';

@Injectable()
export class JwtAccessAuthGuard implements CanActivate {
  constructor(private readonly tokensService: TokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers?.authorization;
      if (!authHeader) {
        throw new UnauthorizedException({ message: 'User unauthorized' });
      }

      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer != 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'User unauthorized' });
      }

      const accessTokenPayload =
        await this.tokensService.verifyAccessJwt(token);
      req.accessTokenPayload = accessTokenPayload;
      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException({ message: 'User unauthorized' });
    }
  }
}
