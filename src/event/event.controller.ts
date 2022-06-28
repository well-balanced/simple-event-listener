import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ReviewService } from 'review/review.service';
import { EventService } from './event.service';
import { Event } from './types';

@Controller()
export class EventController {
  constructor(
    private reviewService: ReviewService,
    private eventService: EventService,
  ) {}

  @Post('/events')
  async events(@Body() event: Event) {
    if (
      this.eventService.isReviewEvent(event) &&
      this.eventService.isValidReviewEvent(event)
    ) {
      return await this.reviewService.handleEvent(event);
    }
    /**
     * Event hanlders
     */
    throw new BadRequestException('invalid event');
  }
}
