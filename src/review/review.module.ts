import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { ReviewService } from './review.service';

@Module({
  providers: [ReviewService, PrismaService],
  exports: [ReviewService],
})
export class ReviewModule {}
