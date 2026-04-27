import { JwtPayload } from 'jsonwebtoken';
import type { User } from '../../../prisma/generated/client';

export type TJwtPayload = JwtPayload & {
  userId: User['id'];
};
