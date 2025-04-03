import { NextResponse } from "next/server";
import { NapiContext, NapiExecuteContext } from "./context";
import { NapiController } from "./controller";
import { NapiHttpCode, NapiHttpStatus, NapiMethod } from "./enums";

export class NapiJsonSchema {
  constructor() {}
}

const statuses = {
  [NapiMethod.GET]: {
    status: NapiHttpStatus.OK,
    statusText: NapiHttpCode.OK,
  },
  [NapiMethod.POST]: {
    status: NapiHttpStatus.CREATED,
    statusText: NapiHttpCode.CREATED,
  },
  [NapiMethod.PUT]: {
    status: NapiHttpStatus.OK,
    statusText: NapiHttpCode.OK,
  },
  [NapiMethod.DELETE]: {
    status: NapiHttpStatus.OK,
    statusText: NapiHttpCode.OK,
  },
  [NapiMethod.PATCH]: {
    status: NapiHttpStatus.OK,
    statusText: NapiHttpCode.OK,
  },
  [NapiMethod.OPTIONS]: {
    status: NapiHttpStatus.OK,
    statusText: NapiHttpCode.OK,
  },
  [NapiMethod.HEAD]: {
    status: NapiHttpStatus.OK,
    statusText: NapiHttpCode.OK,
  },
};

export class NapiResponse {
  constructor(
    private readonly controller: NapiController,
    private readonly context: NapiContext,
    private readonly switchInstance: NapiExecuteContext<NapiResponse>
  ) {}

  async getInit(): Promise<ResponseInit> {
    const router = this.context.getRouter();
    const method = this.context.getMethod();

    const headers: Record<string, string> = {
      ...router.headers,
    };
    
    const cookies = router.cookies;
  
    let rs: Record<string, unknown> = {
      ...statuses[router.method],
      headers,
    };

    headers["set-cookie"] = cookies.map(({ name, value, ...options }) => {
      return router.cookie.serialize(name, value, options);
    }).join("; ");

    if (!method) {
      return rs;
    }

    const payload = this.controller.getResponse(method)!;

    if (!payload) {
      return rs;
    }

    const { status, statusText, headers: payloadHeaders } = payload;

    rs = Object.assign(rs, {
      status,
      statusText,
    });

    if (typeof payloadHeaders === "function") {
      rs.headers = Object.assign(rs.headers as object, await payloadHeaders(this.switchInstance));
    } else if (payloadHeaders instanceof Promise) {
      rs.headers = Object.assign(rs.headers as object, await payloadHeaders);
    } else if (typeof payloadHeaders === "object") {
      rs.headers = Object.assign(rs.headers as object, payloadHeaders);
    }

    return rs;
  }

  async send(data: unknown) {
    return NextResponse.json(data, await this.getInit());
  }
}
