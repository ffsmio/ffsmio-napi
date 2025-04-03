# Napi - API Framework for NextJS

> This is beta. If you do not understand source code from "src" folder. Please do not using it until documentation ready.

## Documentation

_Wait for next version_

## Installation

Generate new project with NextJS App Router (Page Router is not tested yet but it should work.)

```bash
npx create-next-app --use-yarn
```

Install this package

```bash
yarn add @ffsm/napi
```

## Using

Using same NestJS.

Make project folder structure:

```
<project>/
|   |_public/
|   |  ...
|   |_src/
|   |   |_app/
|   |   |   |_api/
|   |   |   |   |_[[...v1]]
|   |   |   |   |   |_route.ts
|   |_package.json
|   |_tsconfig.json
|   |_eslint.config.mjs
|   |_postcss.config.mjs
|   |_yarn.lock
|   |_...
```

Register app for API.

```ts
// <project>/src/app/api/[[...v1]]/route.ts
import { NapiApplication } from "@ffsm/napi";
import { UserController } from "./modules/users/user.controller.ts"

// Remove methods that you does not using.
export const {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  HEAD,
  OPTIONS
} = NapiApplication.register({
  prefix: "v1",
  configs: [], // For load env same @nestjs/config
  controllers: [
    UserController,
  ],
});
```

Make controller

```ts
// <project>/src/app/api/[[...v1]]/modules/users/user.controller.ts

import { Controller, Get, Params } from "@ffsm/napi";

@Controller()
export class UserController {

  @Get()
  getUsers() {
    return [
      { id: 1, name: "User 1" },
    ];
  }

  @Get(":userId")
  getUserById(@Params() params: { userId: string }) {
    return {
      params,
    };
  }
}
```

Update tsconfig.json

```json
{
  ...
  "compilerOptions": {
    ...
    "esModuleInterop": true,
    "strictPropertyInitialization": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    ...
  },
  ...
}
```

OR extends `@ffsm/napi/tsconfig.napi.json`

```json
{
  "extends": "@ffsm/napi/tsconfig.napi.json",
  "compilerOptions": {
    ...
  },
  ...
}
```

## API

### Decorators

- Controller class: `Controller`
- Controller methods: `Get`, `Post`, `Put`, `Patch`, `Delete`, `Options`, `Head`, `HttpStatus`, `HttpText`, `SetHeaders`.
- Controller method params: `Params`, `Body`, `Query`, `Res`, `Req`, `Headers`, `Cookies`, `Files`, `Session`

In this version, initialize service inside constructor of controller.

Next version will support decorator `Injectable()` to make DI for service.

## WIP

- `@Controller()`: Done (will apply `Injectable` when it ready)
- `@Get(), @Post(), ...`: Will support more options.
- `@Injectable()`: In-Progress
- `@ffsm/napi-typeorm`: In-Progress
- `ExceptionFilter`: In-Progress
- `PipeTransform`: In-Progress
- `CanActivate`: In-progress
- `@ffsm/napi-swagger`: To-Do
- ...
