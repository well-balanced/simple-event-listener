import { IsEnum, IsString } from 'class-validator';

export enum EventType {
  REVIEW = 'REVIEW',
  OTHERS = 'OTHERS',
}

export class Event {
  @IsEnum(EventType)
  type: EventType;

  @IsString()
  action: any;
}

type ReviewEventAction = 'ADD' | 'MOD' | 'DELETE';

export interface ReviewEvent {
  type: EventType.REVIEW;
  action: ReviewEventAction;
  reviewId: string;
  userId: string;
  content?: string;
  attachedPhotoIds?: string[];
  placeId?: string;
}
