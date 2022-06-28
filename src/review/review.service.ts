import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { ReviewEvent } from 'event/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ReviewPointOperator } from 'review/types';
import {
  CreateReviewInput,
  UpdateReviewInput,
  GetModOperatorsInput,
} from 'review/review.interface';

@Injectable()
export class ReviewService {
  private _operatorPointMap = {
    [ReviewPointOperator.ContentAdded]: 1,
    [ReviewPointOperator.ContentDeleted]: -1,
    [ReviewPointOperator.PhotoAdded]: 1,
    [ReviewPointOperator.PhotoDeleted]: -1,
    [ReviewPointOperator.LocationBonus]: 1,
    [ReviewPointOperator.LocationBonusRetrieved]: -1,
  };

  private _operatorMessageMap = {
    [ReviewPointOperator.ContentAdded]: '내용 추가',
    [ReviewPointOperator.ContentDeleted]: '내용 삭제',
    [ReviewPointOperator.PhotoAdded]: '사진 추가',
    [ReviewPointOperator.PhotoDeleted]: '사진 삭제',
    [ReviewPointOperator.LocationBonus]: '최초 방문 보너스',
    [ReviewPointOperator.LocationBonusRetrieved]: '최초 방문 보너스 회수',
  };

  constructor(private prisma: PrismaService) {}

  async handleEvent(event: ReviewEvent): Promise<void> {
    switch (event.action) {
      case 'ADD':
        return this.handleAddEvent(event);
      case 'MOD':
        return this.handleModEvent(event);
      case 'DELETE':
        return this.handleDeleteEvent(event);
      default:
        throw new BadRequestException(
          `${event.action} unsupport review action`,
        );
    }
  }

  async handleAddEvent(event: ReviewEvent) {
    if (!event.placeId) {
      throw new BadRequestException('Add event must include placeId');
    }

    const operators = await this._getAddEventOperators(event);
    const point = this._calculatePoint(operators);
    const message = this._composeMessage(operators);

    await this.createReview({
      id: event.reviewId,
      hasPhoto: !!event.attachedPhotoIds?.length,
      content: event.content,
      placeId: event.placeId,
      userId: event.userId,
      point,
      message,
    });
  }

  async handleModEvent(event: ReviewEvent) {
    const lastReview = await this.findById(event.reviewId);
    if (!lastReview) {
      throw new NotFoundException('review does not exist');
    }

    const operators = this._getModOperators({ event, lastReview });
    const point = this._calculatePoint(operators);
    const message = this._composeMessage(operators);

    await this.updateReview({
      id: event.reviewId,
      message,
      content: event.content,
      hasPhoto: !!event.attachedPhotoIds?.length,
      pointDelta: point,
      userId: event.userId,
    });
  }

  async handleDeleteEvent(event: ReviewEvent) {
    await this.deleteReview(event.reviewId);
  }

  async findById(id: string) {
    return await this.prisma.review.findUnique({ where: { externalId: id } });
  }

  async createReview({
    id,
    message,
    content,
    hasPhoto,
    userId,
    placeId,
    point,
  }: CreateReviewInput) {
    const createUserOperation = this.prisma.review.create({
      data: {
        externalId: id,
        content: content,
        hasPhoto,
        user: {
          connectOrCreate: {
            where: { externalId: userId },
            create: { externalId: userId },
          },
        },
        rewarded: point,
        placeId: placeId,
      },
    });

    const increasePointOperation = this.prisma.user.upsert({
      where: { externalId: userId },
      create: {
        externalId: userId,
        point,
        PointLog: { create: { message, amount: point } },
      },
      update: {
        point: { increment: point },
        PointLog: { create: { message, amount: point } },
      },
    });

    try {
      await this.prisma.$transaction([
        createUserOperation,
        increasePointOperation,
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(this.prisma.errorCodeMap[error.code]);
      }

      throw new InternalServerErrorException('unknwon error');
    }
  }

  async updateReview({
    id,
    message,
    content,
    hasPhoto,
    pointDelta,
  }: UpdateReviewInput) {
    return await this.prisma.review.update({
      where: { externalId: id },
      data: {
        content,
        hasPhoto,
        rewarded: { increment: pointDelta },
        user: {
          update: {
            point: { increment: pointDelta },
            PointLog: {
              create: {
                message,
                amount: pointDelta,
              },
            },
          },
        },
      },
    });
  }

  async deleteReview(id: string) {
    const review = await this.findById(id);
    if (!review) {
      throw new NotFoundException(`review does not exist`);
    }

    return await this.prisma.review.update({
      where: { externalId: id },
      data: {
        content: null,
        placeId: null,
        hasPhoto: false,
        rewarded: 0,
        deleted: true,
        user: {
          update: {
            point: { decrement: review.rewarded },
            PointLog: {
              create: {
                message: '리뷰 삭제',
                amount: -review.rewarded,
              },
            },
          },
        },
      },
    });
  }

  private _composeMessage(operators: ReviewPointOperator[]) {
    return operators
      .map((operator) => this._operatorMessageMap[operator])
      .join(', ');
  }

  private async _getAddEventOperators(event: ReviewEvent) {
    const operators: ReviewPointOperator[] = [];

    event.content && operators.push(ReviewPointOperator.ContentAdded);

    event.attachedPhotoIds?.length &&
      operators.push(ReviewPointOperator.PhotoAdded);

    const shouldRewardBonus = !(await this.prisma.review.findFirst({
      where: { deleted: false, placeId: event.placeId },
    }));
    shouldRewardBonus && operators.push(ReviewPointOperator.LocationBonus);

    return operators;
  }
  private _getModOperators({ event, lastReview }: GetModOperatorsInput) {
    const operators: ReviewPointOperator[] = [];

    if (event.content && !lastReview.content) {
      operators.push(ReviewPointOperator.ContentAdded);
    }

    if (!event.content && lastReview.content) {
      operators.push(ReviewPointOperator.ContentDeleted);
    }

    if (event.attachedPhotoIds?.length && !lastReview.hasPhoto) {
      operators.push(ReviewPointOperator.PhotoAdded);
    }

    if (!event.attachedPhotoIds?.length && lastReview.hasPhoto) {
      operators.push(ReviewPointOperator.PhotoDeleted);
    }

    return operators;
  }

  private _calculatePoint(operators: ReviewPointOperator[]) {
    return operators.reduce(
      (prev, curr) => prev + this._operatorPointMap[curr],
      0,
    );
  }
}
