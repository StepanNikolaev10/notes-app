import type { User } from '../../../prisma/generated/client';

export type TAccessTokenPayload = {
  userId: User['id'];
};

export type TRefreshTokenPayload = {
  userId: User['id'];
  sessionId: string;
};
