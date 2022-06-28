import { EventController } from 'event/event.controller';
import { EventService } from 'event/event.service';
import { ReviewService } from 'review/review.service';
import { PrismaService } from 'prisma.service';
import { UserService } from 'user/user.service';
import { UserController } from 'user/user.controller';
import { v4 as uuidv4 } from 'uuid';
import { EventType } from 'event/types';

describe('UserController', () => {
  let eventController: EventController;
  let userService: UserService;
  let reviewService: ReviewService;
  let prismaService: PrismaService;
  let eventService: EventService;
  let userController: UserController;

  beforeEach(() => {
    prismaService = new PrismaService();
    reviewService = new ReviewService(prismaService);
    userService = new UserService(prismaService);
    eventService = new EventService();
    eventController = new EventController(reviewService, eventService);
    userController = new UserController(userService);
  });

  it('포인트 증감이 있을 때마다 이력이 남아야 합니다.', async () => {
    /**
     * Given
     */
    const reviewId = uuidv4();
    const attachedPhotoIds = [uuidv4(), uuidv4()];
    const userId = uuidv4();
    const placeId = uuidv4();

    const addEvent = {
      type: EventType.REVIEW,
      action: 'ADD',
      reviewId,
      content: '좋아요!',
      attachedPhotoIds,
      userId,
      placeId,
    };

    const modEvent = {
      type: EventType.REVIEW,
      action: 'MOD',
      reviewId,
      content: '좋아요!',
      attachedPhotoIds: [], // 사진 삭제
      userId,
      placeId,
    };

    const deleteEvent = {
      type: EventType.REVIEW,
      action: 'DELETE',
      userId,
      reviewId,
    };

    /**
     * When
     */
    await eventController.events(addEvent);
    await eventController.events(modEvent);
    await eventController.events(deleteEvent);

    /**
     * Then
     */
    const { logs } = await userController.getPointLogs(userId);
    /**
     * sort by id DESC
     */
    const [thirdLog, secondLog, firstLog] = logs;
    expect(firstLog.amount).toBe(3);
    expect(secondLog.amount).toBe(-1);
    expect(thirdLog.amount).toBe(-2);
  });

  it('사용자마다 현재 시점의 포인트 총점을 조회하거나 계산할 수 있어야 합니다.', async () => {
    /**
     * Given
     */
    const reviewId = uuidv4();
    const attachedPhotoIds = [uuidv4(), uuidv4()];
    const userId = uuidv4();
    const placeId = uuidv4();

    const addEvent = {
      type: EventType.REVIEW,
      action: 'ADD',
      reviewId,
      content: '좋아요!',
      attachedPhotoIds,
      userId,
      placeId,
    };

    /**
     * When
     */
    await eventController.events(addEvent);

    /**
     * Then
     */
    const { point } = await userController.getPoints(userId);
    expect(point).toBe(3);
  });

  it('리뷰를 작성했다가 삭제하면 해당 리뷰로 부여한 내용 점수와 보너스 점수는 회수합니다.', async () => {
    /**
     * Given
     */
    const reviewId = uuidv4();
    const attachedPhotoIds = [uuidv4(), uuidv4()];
    const userId = uuidv4();
    const placeId = uuidv4();

    const addEvent = {
      type: EventType.REVIEW,
      action: 'ADD',
      reviewId,
      content: '좋아요!',
      attachedPhotoIds,
      userId,
      placeId,
    };

    const deleteEvent = {
      type: EventType.REVIEW,
      action: 'DELETE',
      userId,
      reviewId,
    };

    /**
     * When
     */
    await eventController.events(addEvent);
    await eventController.events(deleteEvent);

    /**
     * Then
     */
    const { logs } = await userController.getPointLogs(userId);
    /**
     * sort by id DESC
     */
    const [secondLog, firstLog] = logs;
    expect(firstLog.amount).toBe(3);
    expect(secondLog.amount).toBe(-3);

    const { point } = await userController.getPoints(userId);
    expect(point).toBe(0);
  });

  describe('리뷰를 수정하면 수정한 내용에 맞는 내용 점수를 계산하여 점수를 부여하거나 회수합니다.', () => {
    it('글만 작성한 리뷰에 사진을 추가하면 1점을 부여합니다.', async () => {
      /**
       * Given
       */
      const reviewId = uuidv4();
      const attachedPhotoIds = [uuidv4(), uuidv4()];
      const userId = uuidv4();
      const placeId = uuidv4();

      const addEvent = {
        type: EventType.REVIEW,
        action: 'ADD',
        reviewId,
        content: '좋아요!',
        attachedPhotoIds: [],
        userId,
        placeId,
      };

      const modEvent = {
        type: EventType.REVIEW,
        action: 'MOD',
        reviewId,
        content: '좋아요!',
        attachedPhotoIds, // 사진 추가
        userId,
        placeId,
      };

      /**
       * When
       */
      await eventController.events(addEvent);
      await eventController.events(modEvent);

      /**
       * Then
       */
      const { logs } = await userController.getPointLogs(userId);
      /**
       * sort by id DESC
       */
      const [secondLog, firstLog] = logs;
      expect(firstLog.amount).toBe(2);
      expect(secondLog.amount).toBe(1);

      const { point } = await userController.getPoints(userId);
      expect(point).toBe(3);
    });

    it('글과 사진이 있는 리뷰에서 사진을 모두 삭제하면 1점을 회수합니다.', async () => {
      /**
       * Given
       */
      const reviewId = uuidv4();
      const attachedPhotoIds = [uuidv4(), uuidv4()];
      const userId = uuidv4();
      const placeId = uuidv4();

      const addEvent = {
        type: EventType.REVIEW,
        action: 'ADD',
        reviewId,
        content: '좋아요!',
        attachedPhotoIds,
        userId,
        placeId,
      };

      const modEvent = {
        type: EventType.REVIEW,
        action: 'MOD',
        reviewId,
        content: '좋아요!',
        attachedPhotoIds: [], // 사진 삭제
        userId,
        placeId,
      };

      /**
       * When
       */
      await eventController.events(addEvent);
      await eventController.events(modEvent);

      /**
       * Then
       */
      const { logs } = await userController.getPointLogs(userId);
      /**
       * sort by id DESC
       */
      const [secondLog, firstLog] = logs;
      expect(firstLog.amount).toBe(3);
      expect(secondLog.amount).toBe(-1);

      const { point } = await userController.getPoints(userId);
      expect(point).toBe(2);
    });
  });

  it('사용자 입장에서 본 "첫 리뷰"일 때 보너스 점수를 부여합니다.', async () => {
    /**
     * Given
     */
    const reviewId = uuidv4();
    const attachedPhotoIds = [uuidv4(), uuidv4()];
    const userId = uuidv4();
    const placeId = uuidv4();

    const addEvent = {
      type: EventType.REVIEW,
      action: 'ADD',
      reviewId,
      content: '좋아요!',
      attachedPhotoIds,
      userId,
      placeId,
    };

    /**
     * When
     */
    await eventController.events(addEvent);

    /**
     * Then
     */
    const { logs } = await userController.getPointLogs(userId);
    expect(logs[0].amount).toBe(3);
    expect(logs[0].message).toContain('최초 방문 보너스');

    const { point } = await userController.getPoints(userId);
    expect(point).toBe(3);
  });

  it('어떤 장소에 사용자 A가 리뷰를 남겼다가 삭제하고, 삭제된 이후 사용자 B가 리뷰를 남기면 사용자 B에게 보너스 점수를 부여합니다.', async () => {
    /**
     * Given
     */
    const userA = uuidv4();
    const reviewA = uuidv4();

    const placeId = uuidv4();

    const addEventByA = {
      type: EventType.REVIEW,
      action: 'ADD',
      reviewId: reviewA,
      content: '좋아요!',
      attachedPhotoIds: [],
      userId: userA,
      placeId,
    };

    const deleteEventByA = {
      type: EventType.REVIEW,
      action: 'DELETE',
      reviewId: reviewA,
      userId: userA,
    };

    await eventController.events(addEventByA);
    await eventController.events(deleteEventByA);

    /**
     * When
     */
    const userB = uuidv4();
    const reviewB = uuidv4();
    const addEventByB = {
      type: EventType.REVIEW,
      action: 'ADD',
      reviewId: reviewB,
      content: '좋아요!',
      attachedPhotoIds: [],
      userId: userB,
      placeId,
    };
    await eventController.events(addEventByB);

    /**
     * Then
     */
    const { logs } = await userController.getPointLogs(userB);
    expect(logs[0].amount).toBe(2);
    expect(logs[0].message).toContain('최초 방문 보너스');

    const { point } = await userController.getPoints(userB);
    expect(point).toBe(2);
  });

  it('어떤 장소에 사용자 A가 리뷰를 남겼다가 삭제하는데, 삭제되기 이전 사용자 B가 리뷰를 남기면 사용자 B에게 보너스 점수를 부여하지 않습니다.', async () => {
    /**
     * Given
     */
    const userA = uuidv4();
    const reviewA = uuidv4();

    const placeId = uuidv4();

    const addEventByA = {
      type: EventType.REVIEW,
      action: 'ADD',
      reviewId: reviewA,
      content: '좋아요!',
      attachedPhotoIds: [],
      userId: userA,
      placeId,
    };

    const deleteEventByA = {
      type: EventType.REVIEW,
      action: 'DELETE',
      reviewId: reviewA,
      userId: userA,
    };

    const userB = uuidv4();
    const reviewB = uuidv4();

    const addEventByB = {
      type: EventType.REVIEW,
      action: 'ADD',
      reviewId: reviewB,
      content: '좋아요!',
      attachedPhotoIds: [],
      userId: userB,
      placeId,
    };

    /**
     * When
     */
    await eventController.events(addEventByA);
    await eventController.events(addEventByB);
    await eventController.events(deleteEventByA);

    /**
     * Then
     */
    const { logs } = await userController.getPointLogs(userB);
    expect(logs[0].amount).toBe(1);
    expect(logs[0].message).not.toContain('최초 방문 보너스');

    const { point } = await userController.getPoints(userB);
    expect(point).toBe(1);
  });
});
