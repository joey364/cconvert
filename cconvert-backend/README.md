# cconvert

[cconvert](https://github.com/joey364/cconvert) - A simple currency conversion platform.

## Project setup

Install package dependencies
```bash
$ npm install
```
Next, copy `.env.example` to `.env` and provide required values
```bash
$ cp .env.example .env
```
See [.env.example](./.env.example)

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment
The application is deployed and served by Render

><strong>PS</strong>: cold starts could delay initial requests for up to 50 seconds.

## Features Implemented
- Added measures to prevent replay attack using nonces 
- Implemented custom rate-limiting middleware to prevent api abuse
- Appropriate route proctection to avoid unauthorized access
- Paginate user transactions retrieved from the database

## Challenges
- Configured cors but isn't enforced because it is sitting behind a reverse proxy and the service on which is hosted doesn't provide a way to customize it to allow the cors headers
  - Solution: switch a hosting provider where there is more control over