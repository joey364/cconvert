This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
Install package dependencies
```bash 
$ npm install
```

Copy `sample.env` to `.env` and provide the values required.
```bash
$ cp sample.env .env
```
See [sample.env](./sample.env)

Next, run the development server:

```bash
$ npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Features implemented
- Login page with client side validation
- Conversion page
- Dashboard showing user conversion history (paginated)
- Setup RTK Query as the source for all data fetching from the api.
- Implemented client-side form validation using yup and native solutions provided by markup tags `e.g. setting type=email for input elements for email validation`

## Challenges ecountered
- Issues with typing of errors returned from generated queries from RTK Query.
  - Solution: Cast the error to any type