import { Injectable } from '@nestjs/common';
import { Event, EventType, ReviewEvent } from 'event/types';

@Injectable()
export class EventService {
  isReviewEvent(event: Event): event is ReviewEvent {
    return event.type === EventType.REVIEW;
  }

  isValidReviewEvent(event: ReviewEvent) {
    if (!event.userId || !event.reviewId) {
      return false;
    }
    return true;
  }
}
