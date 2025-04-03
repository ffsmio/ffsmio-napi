import { NapiExecuteContext } from "./context";
import { NapiHttpStatus, NapiMethod } from "./enums";
import { ucfirst } from "./helpers";
import { NapiCallback, NapiClass, NapiOptionAsync } from "./types";

export interface NapiControllerOptions {
  path?: string;
}

export interface NapiMethodContext {
  controller: NapiController;
  target: object;
  propertyKey: string | symbol;
  descriptor: PropertyDescriptor;
}

export interface NapiMethodOptions {
  path?: string;
}

export type NapiDecoratorHandler<Context, Data = unknown> = NapiCallback<[Data, Context], unknown>;
export type NapiDecorator<Result, Data = unknown> = (options?: Data) => Result;

export interface NapiParamPayload<Options = unknown, Res = unknown> {
  handle: NapiDecoratorHandler<NapiExecuteContext<Res>, Options>;
  target: object;
  options: Options | undefined;
  index: number;
  result?: unknown;
}

export type NapiHeaders<Res = unknown> = NapiOptionAsync<Record<string, string>, NapiExecuteContext<Res>>;
export interface NapiResponsePayload<Res = unknown> {
  status?: NapiHttpStatus;
  statusText?: string;
  headers?: NapiHeaders<Res>;
  cookies?: Record<string, string>;
}

export class NapiController {
  private static decorators: Map<object, NapiController> = new Map();

  private prefix: string | undefined;

  private routes: Map<string, string>;

  private params: Map<string, NapiParamPayload[]>;

  private response: Map<string, NapiResponsePayload>;

  private instance: unknown;

  private constructor(private readonly targer: object) {
    this.routes = new Map();
    this.params = new Map();
    this.response = new Map();
  }

  setPrefix(options: string | NapiControllerOptions = "") {
    let path = '';
    
    if (typeof options === 'string') {
      path = options;
    } else {
      path = options.path || '';
    }

    this.prefix = path;
  }

  getPrefix() {
    return this.prefix;
  }

  setRoute(method: string, route: string) {
    this.routes.set(method, route);
    return this;
  }

  getRoutes<T extends string | undefined = string | undefined>(
    method?: T
  ): T extends string ? string : Map<string, string> {
    if (method) {
      return this.routes.get(method)! as T extends string ? string : Map<string, string>;
    }

    return this.routes as T extends string ? string : Map<string, string>;
  }

  setParam<Options = unknown, Res = unknown>(method: string, payload: NapiParamPayload<Options, Res>) {
    const existing = (this.getParams(method) ?? []).filter((param) => param.index !== payload.index);
    this.params.set(method, [...existing, payload] as NapiParamPayload[]);
    return this;
  }

  getParams(method: string) {
    return this.params.get(method);
  }

  setResponse(method: string, payload: NapiResponsePayload) {
    const res = Object.assign({}, this.response.get(method) ?? {}, payload);
    this.response.set(method, res);
    return this;
  }

  getResponse(method: string) {
    return this.response.get(method);
  }

  hasPrefix() {
    return this.prefix !== undefined;
  }

  getName() {
    return this.targer.constructor.name;
  }

  hasRoutes() {
    return !!this.routes.size;
  }

  getInstance() {
    if (!this.instance) {
      const target = this.targer as NapiClass;
      this.instance = new target();
    }

    return this.instance as object;
  }

  static from(target: object) {
    if (this.decorators.has(target)) {
      return this.decorators.get(target)!;
    }

    const controller = new NapiController(target);
    this.decorators.set(target, controller);
    return controller;
  }

  static createControllerDecorator() {
    return (options?: string | NapiControllerOptions): ClassDecorator => {
      return (target) => {
        const controller = this.from(target);
        controller.setPrefix(options);
        return target;
      };
    };
  }

  static createMethodDecorator<Data = unknown>(
    handler: NapiDecoratorHandler<NapiMethodContext, Data>
  ): NapiDecorator<MethodDecorator, Data> {
    return (options) => {
      return (target, propertyKey, descriptor) => {
        const controller = NapiController.from(target.constructor);

        handler(...[options, {
          controller,
          target,
          propertyKey,
          descriptor,
        }] as [Data, NapiMethodContext]);

        return descriptor;
      };
    };
  }

  static createParamDecorator<Data = unknown, Res = unknown>(
    handle: NapiDecoratorHandler<NapiExecuteContext<Res>, Data>
  ): NapiDecorator<ParameterDecorator, Data> {
    return (options) => {
      return (target, methodKey, index) => {
        if (!methodKey) {
          return;
        }

        const controller = NapiController.from(target.constructor);
        controller.setParam<Data, Res>(String(methodKey), {
          handle,
          options,
          target,
          index,
        });
        
        return index;
      };
    };
  }

  static has(controller: object) {
    return this.decorators.has(controller);
  }

  static get(controller: object) {
    return this.decorators.get(controller)!;
  }
}

export type NapiMethodCapitalized = Capitalize<Lowercase<NapiMethod>>;

export const Controller = NapiController.createControllerDecorator();
export const createMethodDecorator = NapiController.createMethodDecorator;
export const createParamDecorator = NapiController.createParamDecorator;

export const { Get, Post, Put, Patch, Delete, Options, Head } = Object
  .values(NapiMethod)
  .filter((method) => typeof method === 'string')
  .reduce((acc, method) => {
    const capitalized = ucfirst(method);
    acc[capitalized] = NapiController.createMethodDecorator<string | NapiMethodOptions>((data, ctx) => {
      const path = (typeof data === 'string' ? data : data?.path) || "/";
      ctx.controller.setRoute(`${method}:${path}`, String(ctx.propertyKey));
    })
    return acc;
  }, {} as Record<NapiMethodCapitalized, NapiDecorator<MethodDecorator, string | NapiMethodOptions>>);

const names = ['body', 'query', 'params', 'headers', 'cookies', 'files', 'session', 'res', 'req'] as const;
type Capitailized = Capitalize<typeof names[number]>;

export const {
  Body,
  Query,
  Params,
  Headers,
  Cookies,
  Files,
  Session,
  Res,
  Req,
} = names.reduce((acc, name) => {
  const capitalized = ucfirst(name);
  acc[capitalized] = NapiController.createParamDecorator((_, ctx) => {
    if (name  === 'res') {
      return ctx.getResponse();
    }

    if (name === 'req') {
      return ctx.getRequest();
    }

    const router = ctx.getRouter();
    return router[name as keyof typeof router];
  });

  return acc;
}, {} as Record<Capitailized, NapiDecorator<ParameterDecorator>>);

export const HttpText = NapiController.createMethodDecorator<string>((statusText, ctx) => {
  ctx.controller.setResponse(String(ctx.propertyKey), { statusText });
});

export const HttpStatus = NapiController.createMethodDecorator<NapiHttpStatus>((status, ctx) => {
  ctx.controller.setResponse(String(ctx.propertyKey), { status });
});

export const SetHeaders = NapiController.createMethodDecorator<NapiHeaders>((headers, ctx) => {
  ctx.controller.setResponse(String(ctx.propertyKey), { headers });
});
