# simple event listener

간단한 이벤트 리스너 서버입니다. 테이블 DDL은 [여기](https://github.com/well-balanced/simple-event-listener/blob/main/prisma/migrations/20220628114322_/migration.sql)에서 확인해주세요.

## 💡 Tech stack

- TypeScript
- Nest.js
- MySQL
- Node v16


## 🔨 Setup
> 📌 Docker를 사용하신다면 `.env` 값을 그대로 활용하셔도 되고, 그렇지 않으시다면 `DATABASE_URL` 값을 변경해주세요.

```sh
# Docker를 사용하는 경우
$ npm run docker:dev

$ npm i
$ npm run prisma:gen && npm run migrate:dev
$ npm run start:dev
```

## 📄 Docs

**Swagger:** http://localhost:3000/docs


## ✅ Test
> 📌 unit test는 [user.controller.spec.ts](https://github.com/well-balanced/simple-event-listener/blob/main/src/user/user.controller.spec.ts)에서 e2e test는 [app.e2e-spec.ts](https://github.com/well-balanced/simple-event-listener/blob/main/test/app.e2e-spec.ts)에서 확인하실 수 있습니다

```sh
$ npm run test
$ npm run test *.spec.ts # 특정 파일 테스트
```

### e2e test

```sh
$ npm run test:e2e
```

### Test coverage

```sh
$ npm run test:cov
```

### Seed 데이터 생성 및 조회 테스트

```sh
$ npm run prisma:seed -- --seedReviews --findLogs
```

## 🗄 ERD diagram

![triple](https://user-images.githubusercontent.com/48206623/176199054-05ee58dd-3a79-403c-b0bb-5eb144b4b962.png)
