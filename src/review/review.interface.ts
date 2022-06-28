import { ReviewEvent } from 'event/types';
import { Review } from '@prisma/client';

export interface GetModOperatorsInput {
  event: ReviewEvent;
  lastReview: Review;
}
export interface CreateReviewInput {
  id: string;
  message: string;
  content: string;
  hasPhoto: boolean;
  userId: string;
  placeId: string;
  point: number;
}

export interface UpdateReviewInput {
  id: string;
  message: string;
  content?: string;
  hasPhoto?: boolean;
  pointDelta: number;
  userId: string;
}
