import { Injectable, NotFoundException } from '@nestjs/common';
import {} from '@prisma/client';
import { PrismaService } from 'prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getPoints(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { externalId: userId },
      select: { point: true },
    });

    if (!user) {
      throw new NotFoundException('user does not exist');
    }

    return user.point;
  }

  async getPointLogs(userId: string) {
    return await this.prisma.pointLog.findMany({
      where: { userId },
      take: 20,
      select: { amount: true, message: true },
      orderBy: { id: 'desc' },
    });
  }
}
