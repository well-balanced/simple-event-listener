import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

async function seedReviews() {
  const RECORD_COUNT = 10000;
  const CHUNK_SIZE = 100;
  const OPERATION_COUNT = RECORD_COUNT / CHUNK_SIZE;

  for (let i = 0; i < OPERATION_COUNT; i++) {
    const userId = uuidv4();
    await prisma.user.create({ data: { externalId: userId } });
    const promises = Array.from({
      length: CHUNK_SIZE,
    }).map(() => {
      /**
       * 유저당 100개씩
       */
      const reviewId = uuidv4();
      const placeId = uuidv4();
      const amount = getRandomInt(1, 3);
      const createOperation = prisma.review.create({
        data: {
          externalId: reviewId,
          content: 'content',
          hasPhoto: false,
          user: {
            connectOrCreate: {
              where: { externalId: userId },
              create: { point: amount, externalId: userId },
            },
          },
          rewarded: amount,
          placeId,
        },
      });

      const increaseOperation = prisma.user.update({
        where: { externalId: userId },
        data: {
          point: { increment: amount },
          PointLog: { create: { message: '시드 데이터', amount } },
        },
      });

      return prisma.$transaction([createOperation, increaseOperation]);
    });

    await Promise.all(promises);
  }
  console.log(`${RECORD_COUNT} reviews are created ✅`);
}

async function queryTime<T>(
  fn: () => Promise<T>,
  operationCount: number = 1,
): Promise<T[]> {
  const start = Date.now();
  const resultAll: T[] = [];
  for (let i = 0; i < operationCount; i++) {
    const result = await fn();
    resultAll.push(result);
  }
  const end = Date.now();
  console.log(
    `${operationCount > 1 ? 'average query' : 'query'} time: taken ${
      (end - start) / 1000 / operationCount
    } seconds`,
  );
  return resultAll;
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes('--seedReviews')) {
    /**
     * 리뷰 만개 시드 데이터 생성
     */
    await queryTime(seedReviews);
  }

  if (argv.includes('--findLogs')) {
    /**
     * 포인트 이력 조회
     */
    const user = await prisma.user.findFirst({ orderBy: { id: 'desc' } });
    const fn = () =>
      prisma.pointLog.findMany({
        where: { userId: user?.externalId },
      });
    const [result] = await queryTime(fn);
    console.log(`found ${result.length} logs ✅`);
  }

  console.log('seed success ✅');
}

main();
