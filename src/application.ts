import { NextRequest, NextResponse } from "next/server";
import { sync } from "./helpers/sync";
import { NapiMethod } from "./enums";
import { NapiRouter } from "./router";
import { matchRoute } from "./helpers/match-route";
import { NapiResponse } from "./response";
import { NapiController } from "./controller";
import { NapiContext } from "./context";
import { NapiConfiguration, NapiConfigurationRegister } from "./configuration";
import {
  NapiCallback,
  NapiClass,
  NapiOptionAsync,
  NapiRouteHandler,
  NapiRoutePayload,
} from "./types";


export interface NapiApplicationOptions {
  configs?: Record<string, NapiConfigurationRegister>;
  prefix?: NapiOptionAsync<string, NapiConfiguration>;
  controllers?: NapiClass[];
}

export type NapiApplicationHandlers<Params = unknown> = Record<Uppercase<NapiMethod>, NapiRouteHandler<Params>>;

export interface NapiControllerInjected<Instance = unknown> {
  class: NapiClass;
  instance: Instance;
}

export class NapiApplication {
  private static controllers: Map<NapiClass, NapiControllerInjected>;

  private configuration: NapiConfiguration;

  private req: NextRequest;
  private res: NapiResponse;
  private payload: NapiRoutePayload;
  private prefix = "";

  private router: NapiRouter;
  private route = "";
  
  private context: NapiContext;
  private controller: NapiController;
  private controllerMethod: string;
  private params: Record<string, string> = {}; // Detech from route

  private constructor(private readonly options: NapiApplicationOptions) {
    if (!NapiApplication.controllers) {
      NapiApplication.controllers = new Map();
    }
  }

  private getRequest() {
    return this.req;
  }

  private getRouter() {
    if (!this.router) {
      this.initRouter();
    }
    return this.router;
  }

  private getPayload() {
    return this.payload;
  }

  private getController<Controller = unknown>(): Controller {
    return this.controller.getInstance() as Controller;
  }

  private getConfig<Type = unknown>(name: string): Type | undefined {
    return this.configuration.get<Type>(name);
  }

  private getResponse() {
    if (!this.res) {
      this.initResponse();
    }
    return this.res;
  }

  private get method() {
    return this.req.method.toUpperCase() as NapiMethod;
  }

  private createExcutionContext() {
    return {
      getRequest: this.getRequest.bind(this),
      getRouter: this.getRouter.bind(this),
      getPayload: this.getPayload.bind(this),
      getController: this.getController.bind(this),
      getConfig: this.getConfig.bind(this),
      getResponse: this.getResponse.bind(this),
    };
  }

  private async initializeConfiguration() {
    this.configuration = await NapiConfiguration.initialize(this.options.configs ?? {});
  }

  private async extractPrefix() {
    if (!this.options.prefix) {
      return this;
    }

    const prefix = this.options.prefix;

    if (typeof prefix === "function") {
      this.prefix = await prefix(this.configuration);
    } else if (typeof prefix === "string") {
      this.prefix = prefix;
    }
  }

  private async extractRoute() {
    const params = await this.payload.params as Record<string, string[]>;
    if (!params) {
      this.route = "";
      return this;
    }

    const route = Object.values(params)[0];
    this.route = route ? route.join("/") : "";

    return this;
  }

  private initRouter() {
    if (this.router) {
      return this;
    }
    this.router = new NapiRouter(this.req, this.route, this.params);
    return this;
  }

  private async loadController() {
    const controllers = this.options.controllers ?? [];

    if (!controllers.length) {
      return;
    }

    for (let index = 0; index < controllers.length; index++) {
      const controller = controllers[index];

      if (!NapiController.has(controller)) {
        continue;
      }

      const instance = NapiController.get(controller);
      const name = instance.getName();

      if (!instance.hasPrefix()) {
        throw new Error(`Please using @Controller() decorator on ${name}`);
      }

      const prefix = instance.getPrefix();
      const controllerRoute = `/${this.prefix}/${prefix}/`.replace(/\/+/g, "/");
      const requestRoute = `/${this.route}/`.replace(/\/+/g, "/");

      if (!requestRoute.startsWith(controllerRoute)) {
        continue;
      }

      this.controller = instance;
      break;
    }
  }

  private loadMethods() {
    if (!this.controller) {
      return;
    }

    if (!this.controller.hasRoutes()) {
      // TODO: throw error no routes decorated
      return;
    }

    const routes = this.controller.getRoutes() as Map<string, string>;
    const routeKeys = Array.from(routes.keys());

    for (let index = 0; index < routeKeys.length; index++) {
      const methodName = routeKeys[index];
      const [ method, ...remain ] = methodName.split(":");

      if (method.toUpperCase() !== this.method) {
        continue;
      }

      const route = `/${this.prefix}/${this.controller.getPrefix()}/${remain.join(":")}`.replace(/\/+/g, "/");
      const params = matchRoute(route, this.route);

      if (!params) {
        continue;
      }

      this.controllerMethod = routes.get(methodName)!;
      this.params = params;
    }
  }

  private async loadParameters() {
    this.context = new NapiContext(this.prefix, this.controller, this.createExcutionContext(), this.params);
    this.params = (await this.context.execute(this.route)).getRouteParams();
  }

  private initResponse() {
    this.res = new NapiResponse(
      this.controller,
      this.context,
      this.createExcutionContext()
    );
  }

  private async execute(): Promise<NextResponse | Response> {
    if (!this.controllerMethod) {
      return new Response(null);
    }

    const instance = this.controller.getInstance();
    const method = instance[this.controllerMethod as keyof typeof instance];
    const params = this.context.getDecoratorParams();
    const result = await (method as NapiCallback<unknown[], unknown>).bind(instance)(...params);
    return this.res.send(result);
  }

  private async dispatch(req: NextRequest, payload: NapiRoutePayload) {
    this.req = req;
    this.payload = payload;

    await sync(
      [this.initializeConfiguration.bind(this)],
      [this.extractPrefix.bind(this)],
      [this.extractRoute.bind(this)],
      [this.loadController.bind(this)],
      [this.loadMethods.bind(this)],
      [this.loadParameters.bind(this)],
      [this.initRouter.bind(this)],
      [this.initResponse.bind(this)],
    );

    return await this.execute();
  }

  static register(options: NapiApplicationOptions) {
    return Object
      .values(NapiMethod)
      .filter((method) => typeof method === "string")
      .reduce((acc, method) => {
        const upper = method.toUpperCase() as Uppercase<NapiMethod>;
        acc[upper] = (req, payload) => (new NapiApplication(options).dispatch(req, payload));
        return acc;
      }, {} as NapiApplicationHandlers);
  }
}