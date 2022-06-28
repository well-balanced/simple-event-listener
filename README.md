# simple event listener

간단한 이벤트 리스너 서버입니다.

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

## ✅ Test

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

## 🗄 ERD diagram
