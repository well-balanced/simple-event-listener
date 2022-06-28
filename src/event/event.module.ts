import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { EventController } from 'event/event.controller';
import { EventService } from 'event/event.service';
import { ReviewService } from 'review/review.service';

@Module({
  providers: [EventService, PrismaService, ReviewService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
