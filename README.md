# shelter-api

Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg

<div align="center">
  <h1>shelter-api</h1>
  <p>NodeJS/Express Shelter API server responsible for serving the API consumed by shelter-app.</p>
  </div>
</div>

## Features

Generated service includes the following features:

-   [x] [Express.js](https://expressjs.com)
-   [x] [MongoDB](https://mongodb.com) ODM using [Mongoose](https://mongoosejs.com)
-   [x] Code structure inspired by [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) & [Uncle Bob Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

Other features:

-   [x] [Webpack](https://webpack.js.org) with [Typescript](https://www.typescriptlang.org) using [@boringcodes/backpack](https://github.com/boringcodes/backpack)
-   [x] [Prettier](https://prettier.io) using [@boringcodes/prettier-config](https://github.com/boringcodes/prettier-config)
-   [x] [ESLint](https://eslint.org) using [@boringcodes/eslint-config-typescript](https://github.com/boringcodes/eslint-config-typescript)
-   [x] [Husky](https://github.com/typicode/husky)
-   [x] [Lint Staged](https://github.com/okonet/lint-staged)
-   [x] [NVM](https://github.com/nvm-sh/nvm)
-   [x] [Dockerfile](https://docker.com)
-   [x] [Standard Version](https://github.com/conventional-changelog/standard-version)

## Quick Overview

```tree
.
├── Dockerfile
├── README.md
├── backpack.config.js
├── build
│   ├── index.js
│   └── index.map
├── deploy.sh
├── key.json
├── package.json
├── src
│   ├── app.ts
│   ├── components
│   │   ├── accounts
│   │   │   ├── constants.ts
│   │   │   ├── model.ts
│   │   │   └── repository.ts
│   │   ├── auth
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   └── middleware.ts
│   │   ├── bot
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   └── utils.ts
│   │   ├── cities
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   ├── model.ts
│   │   │   └── repository.ts
│   │   ├── common
│   │   │   ├── dashbot
│   │   │   │   ├── dashbot.ts
│   │   │   │   └── index.ts
│   │   │   ├── facebook
│   │   │   │   ├── facebook.ts
│   │   │   │   └── index.ts
│   │   │   ├── firebase
│   │   │   │   ├── firebase.ts
│   │   │   │   └── index.ts
│   │   │   ├── gmail
│   │   │   │   ├── gmail.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── google
│   │   │   │   ├── google.ts
│   │   │   │   └── index.ts
│   │   │   ├── google-dialogflow
│   │   │   │   ├── constants.ts
│   │   │   │   ├── google-dialogflow.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── intent-data.ts
│   │   │   │   └── struct-json.ts
│   │   │   ├── google-maps
│   │   │   │   ├── google-maps.ts
│   │   │   │   └── index.ts
│   │   │   ├── instagram
│   │   │   │   ├── index.ts
│   │   │   │   └── instagram.ts
│   │   │   ├── passport
│   │   │   │   ├── index.ts
│   │   │   │   └── strategies
│   │   │   │       ├── facebook.ts
│   │   │   │       ├── google.ts
│   │   │   │       ├── instagram.ts
│   │   │   │       ├── jwt.ts
│   │   │   │       ├── local.ts
│   │   │   │       └── twitter.ts
│   │   │   ├── push-notifications
│   │   │   │   ├── index.ts
│   │   │   │   └── push-notifications.ts
│   │   │   ├── time-parser
│   │   │   │   ├── index.ts
│   │   │   │   └── time-parse.ts
│   │   │   ├── twitter
│   │   │   │   ├── index.ts
│   │   │   │   └── twitter.ts
│   │   │   └── yup-custom
│   │   │       └── index.ts
│   │   ├── crisis-lines
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   ├── model.ts
│   │   │   ├── repository.ts
│   │   │   └── utils.ts
│   │   ├── feedbacks
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   ├── model.ts
│   │   │   └── repository.ts
│   │   ├── files
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   └── utils.ts
│   │   ├── services
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   ├── model.ts
│   │   │   ├── repository.ts
│   │   │   └── utils.ts
│   │   ├── static-pages
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   ├── model.ts
│   │   │   └── repository.ts
│   │   ├── templates
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   ├── model.ts
│   │   │   └── repository.ts
│   │   ├── types.ts
│   │   ├── users
│   │   │   ├── constants.ts
│   │   │   ├── controller.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware.ts
│   │   │   ├── model.ts
│   │   │   └── repository.ts
│   │   └── zips
│   │       ├── constants.ts
│   │       ├── controller.ts
│   │       ├── index.ts
│   │       ├── middleware.ts
│   │       ├── model.ts
│   │       └── repository.ts
│   ├── index.ts
│   ├── init-data.ts
│   └── routes.ts
├── tsconfig.json
├── tslint.json
└── yarn.lock
```

### Prerequisites

For starters, we use `.env` files to configre lots of environment variables.
Check the `.env.sample` for a starter file. It's best you read the comments
in that file if you have questions or want to learn more what each does.

## Usage

### Installing packages

```sh
$ yarn
```

### Development

We start of in one terminal with the typrscript watcher with:

```sh
$ yarn dev
```

We're done. We can edit typescript files in `src/components` and see changes in the api without restarting the server.

-   `yarn start` will start the api server and read the `.env` config file.

-   `yarn dev` will compile and correctly watch files. Use this when writing
    code in `.ts` files.

### Production

Compile the api folder typecript files. Same as the old build command

```sh
$ yarn build && yarn start
```

## Deployment

You'll need to create a [deploy token](https://docs.gitlab.com/ee/user/project/deploy_tokens/#creating-a-deploy-token) to make this work, with at least the read registry and write registry scopes.

Make sure that you have [docker](https://docs.docker.com/get-docker/) installed and have logged into the shelter-api registry with

```
docker login -u <username> -p <deploy_token> registry.gitlab.com/shelterappdev/shelter-api
```

To deploy to production, simply run:

```sh
  ./deploy.sh
```

## API Docs

https://documenter.getpostman.com/view/185196/Tzedfj4K

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
