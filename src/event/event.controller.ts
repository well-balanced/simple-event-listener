import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ReviewService } from 'review/review.service';
import { EventService } from 'event/event.service';
import { Event } from 'event/types';
import { docs } from 'event/event.docs';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('event')
@Controller()
export class EventController {
  constructor(
    private reviewService: ReviewService,
    private eventService: EventService,
  ) {}

  @Post('/events')
  @docs.events('이벤트 핸들러')
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
