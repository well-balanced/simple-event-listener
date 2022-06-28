import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { v4 as uuidv4 } from 'uuid';

describe('e2e test', () => {
  let app: INestApplication;
  let reviewId: string;
  let attachedPhotoIds: string[];
  let userId: string;
  let placeId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeAll(() => {
    reviewId = uuidv4();
    attachedPhotoIds = [uuidv4(), uuidv4()];
    userId = uuidv4();
    placeId = uuidv4();
  });

  describe('POST /events', () => {
    it('ADD action', () => {
      const addEvent = {
        type: 'REVIEW',
        action: 'ADD',
        reviewId,
        content: '좋아요!',
        attachedPhotoIds,
        userId,
        placeId,
      };

      return request(app.getHttpServer())
        .post('/events')
        .send(addEvent)
        .expect(201);
    });

    it('MOD action', () => {
      const modEvent = {
        type: 'REVIEW',
        action: 'MOD',
        reviewId,
        content: '좋아요!',
        attachedPhotoIds: [], // 사진 삭제
        userId,
        placeId,
      };

      return request(app.getHttpServer())
        .post('/events')
        .send(modEvent)
        .expect(201);
    });

    it('DELETE action', () => {
      const deleteEvent = {
        type: 'REVIEW',
        action: 'DELETE',
        userId,
        reviewId,
      };

      return request(app.getHttpServer())
        .post('/events')
        .send(deleteEvent)
        .expect(201);
    });
  });

  it('GET /users/:userId/points', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}/points`)
      .expect(({ body }) => {
        expect(body.point).toBe(0);
      });
  });

  it('GET /users/:userId/point-logs', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}/point-logs`)
      .expect(({ body }) => {
        /**
         * sort by id DESC
         */
        const [thirdLog, secondLog, firstLog] = body.logs;
        expect(firstLog.amount).toBe(3);
        expect(secondLog.amount).toBe(-1);
        expect(thirdLog.amount).toBe(-2);
      });
  });
});
