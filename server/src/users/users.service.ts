import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  createOne(email: string, username: string, hashedPassword: string) {
    if (!email || !username || !hashedPassword) {
      throw new BadRequestException();
    }
    
    return this.prismaService.user.create({
      data: {
        email,
        username,
        hashedPassword,
      },
    });
  }

  getOneById(id?: string) {
    if (!id) {
      throw new BadRequestException();
    }

    return this.prismaService.user.findFirst({
      where: {
        id,
      },
    });
  }

  getOneByEmail(email?: string) {
    if (!email) {
      throw new BadRequestException();
    }

    return this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
  }
}
