import { NextRequest } from "next/server";
import { NapiRouter } from "./router";
import { NapiClass, NapiRoutePayload } from "./types";
import { NapiController } from "./controller";
import { matchRoute } from "./helpers/match-route";

export interface NapiControllerInject<Instance = unknown> {
  class: NapiClass;
  instance: Instance;
}

export interface NapiExecuteContext<Response> {
  getRequest(): NextRequest;
  getRouter(): NapiRouter;
  getPayload(): NapiRoutePayload;
  getConfig<ConfigType = unknown>(name: string): ConfigType | undefined;
  getResponse(): Response;
}

export class NapiContext {
  private decoratorParams: Array<unknown> = [];
  private method: string;

  constructor(
    private readonly prefix: string,
    private readonly controller: NapiController,
    private readonly switchInstance: NapiExecuteContext<unknown>,
    private routeParams: Record<string, string> = {},
  ) {}

  getRequest() {
    return this.switchInstance.getRequest();
  }

  getRouter() {
    return this.switchInstance.getRouter();
  }

  getPayload() {
    return this.switchInstance.getPayload();
  }

  getConfig<ConfigType = unknown>(name: string): ConfigType | undefined {
    return this.switchInstance.getConfig<ConfigType>(name);
  }

  getResponse() {
    return this.switchInstance.getResponse();
  }

  getController<Controller = unknown>(): Controller {
    return this.controller.getInstance() as Controller;
  }

  execute(route: string) {
    if (!this.controller) {
      throw new Error("Controller not found");
    }

    if (!this.findMethod(route).method) {
      throw new Error("No route found");
    }

    return this.initDecoratorParams();
  }

  getMethod() {
    return this.method;
  }

  getRouteParams() {
    return this.routeParams;
  }

  getDecoratorParams() {
    return this.decoratorParams;
  }

  private findMethod(reqRoute: string) {
    reqRoute = `/${reqRoute}`.replace(/\/+/g, "/");
    const request = this.getRequest();

    const routes = this.controller.getRoutes() as Map<string, string>;
    const keys = Array.from(routes.keys());

    for (let index = 0; index < keys.length; index++) {
      const methodName = keys[index];
      const [ method, ...remain ] = methodName.split(":");

      if (method.toUpperCase() !== request.method.toUpperCase()) {
        continue;
      }

      const route = `/${this.prefix}/${this.controller.getPrefix()}/${remain.join(":")}`.replace(/\/+/g, "/");
      const params = matchRoute(route, reqRoute);

      if (!params) {
        continue;
      }

      this.method = routes.get(methodName)!;
      this.routeParams = params;

      break;
    }

    return this;
  }

  private async initDecoratorParams() {
    if (!this.method) {
      return this;
    }

    const params = this.controller.getParams(this.method) ?? [];
    const indexes = params.map((param) => param.index);

    indexes.push(-1);
    const maxIndex = Math.max(...indexes);

    const decorators = await Promise.all(
      params.map(async (params) => {
        const result = await params.handle(params.options, this.switchInstance);
        return {
          index: params.index,
          result,
        };
      }),
    );

    for (let index = 0; index <= maxIndex; index++) {
      const param = decorators.find((d) => d.index === index);
      this.decoratorParams.push(param?.result);
    }

    return this;
  }
}
