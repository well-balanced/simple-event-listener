# simple event listener

this is simple event listner server. table DDL is [here](https://github.com/well-balanced/simple-event-listener/blob/main/prisma/migrations/20220628114322_/migration.sql)

## Tech stack

- TypeScript
- Nest.js
- MySQL
- Node v16


## Setup
> 📌 if you are using Docker, you can just use `.env` as it is, or change `DATABASE_URL` in `.env`

```sh
# using docker
$ npm run docker:dev

$ npm i
$ npm run prisma:gen && npm run migrate:dev
$ npm run start:dev
```

## Docs

**Swagger:** http://localhost:3000/docs


## Test
> 📌 you can check e2e test in [app.e2e-spec.ts](https://github.com/well-balanced/simple-event-listener/blob/main/test/app.e2e-spec.ts) file.

```sh
$ npm run test
$ npm run test *.spec.ts # testing specific files
```

### e2e test

```sh
$ npm run test:e2e
```

### Test coverage

```sh
$ npm run test:cov
```

### Generate Seed data and performance test

```sh
$ npm run prisma:seed -- --seedReviews --findLogs
```

## ERD diagram

![ERD](https://user-images.githubusercontent.com/48206623/176199054-05ee58dd-3a79-403c-b0bb-5eb144b4b962.png)
