import { NextRequest, NextResponse } from "next/server";

export type NapiClass<Props = object> = Props & {
  new (...args: any[]): any;
}

export interface NapiRoutePayload<Params = unknown> {
  params: Promise<Params>;
}

export interface NapiRouteHandler<Params = unknown> {
  (req: NextRequest, payload: NapiRoutePayload<Params>): Promise<NextResponse | Response>;
}

export type NapiCallback<Param, Return = unknown> = (
  ...args: Param extends Array<unknown> ? Param : [Param]
) => Return | Promise<Return>;
export type NapiOptionAsync<Return = unknown, Param = unknown> = Return | NapiCallback<Param, Return>;
