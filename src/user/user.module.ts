import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { UserController } from 'user/user.controller';
import { UserService } from 'user/user.service';

@Module({
  providers: [UserService, PrismaService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
