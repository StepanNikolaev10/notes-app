import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import type { Session } from './types/session.interface';
import type { CreateSessionArgs, UpdateSessionArgs } from './types/services/sessions-service-args.interfaces';
import type { UpdateSessionResult } from './types/services/sessions-service-results.types';

@Injectable()
export class SessionsService {
  private readonly SESSION_PREFIX = 'session:';

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {}

  async createSession(args: CreateSessionArgs): Promise<void> {
    const key = `${this.SESSION_PREFIX}${args.sessionId}`;

    const sessionPayload = {
      userId: args.userId,
      createdAt: Date.now()
    };

    await this.redis.set(key, JSON.stringify(sessionPayload), 'EX', this.configService.get<number>('JWT_REFRESH_EXPIRES_IN')!);
  }

  async updateSession(args: UpdateSessionArgs): Promise<UpdateSessionResult> {
    const currentKey = `${this.SESSION_PREFIX}${args.currentSessionId}`;
    const newKey = `${this.SESSION_PREFIX}${args.newSessionId}`;
    const newExpiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN')!;
    const gracePeriodSeconds = 15;

    const luaScript = `
      local currentSessionStr = redis.call('GET', KEYS[1])
      
      if not currentSessionStr then 
        return 'NOT_FOUND' 
      end

      local session = cjson.decode(currentSessionStr)

      if not session.isUpdated then
        session.isUpdated = true
        redis.call('SET', KEYS[1], cjson.encode(session), 'EX', tonumber(ARGV[4]))
        
        local newSession = {
          userId = tonumber(ARGV[1]),
          createdAt = tonumber(ARGV[2]),
          isUpdated = false
        }
        redis.call('SET', KEYS[2], cjson.encode(newSession), 'EX', tonumber(ARGV[3]))

        return 'OK'
      else
        return 'ALREADY_UPDATED'
      end
    `;

    const result = await this.redis.eval(
      luaScript,
      2,
      currentKey,
      newKey,
      args.userId,
      Date.now(),
      newExpiresIn,
      gracePeriodSeconds
    );

    return result as UpdateSessionResult;
  }

  async getSession(sessionId: Session['id']): Promise<Session | null> {
    const sessionJson = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
    if (!sessionJson) return null;
    const session = JSON.parse(sessionJson);
    return session;
  }

}
