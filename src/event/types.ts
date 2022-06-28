import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  REVIEW = 'REVIEW',
  OTHERS = 'OTHERS',
}

export class Event {
  @IsEnum(EventType)
  @ApiProperty({
    example: 'REVIEW',
    description: '이벤트 타입',
    enum: EventType,
  })
  type: EventType;

  @IsString()
  @ApiProperty({
    example: 'ADD',
    description: '행위',
  })
  action: any;
}

type ReviewEventAction = 'ADD' | 'MOD' | 'DELETE';

export interface ReviewEvent {
  type: EventType.REVIEW;
  action: ReviewEventAction;
  reviewId: string;
  userId: string;
  content: string;
  attachedPhotoIds?: string[];
  placeId?: string;
}
