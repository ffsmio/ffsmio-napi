import { NextRequest } from "next/server";
import { NapiContent, NapiMethod } from "./enums";
import { Cookie } from "@ffsm/cookie";
import { parse } from "./helpers/parse";

export class NapiRouter {
  private _headers: Record<string, string> = {};
  private _cookie: Cookie;
  private _method: NapiMethod;
  private _url: string;
  private _mode: string;
  private _host: string;
  private _schema: string | undefined = undefined;
  private _hostname: string | undefined = undefined;
  private _port: number | undefined = undefined;
  private _userAgent: string | undefined = undefined;
  private _href: string | undefined = undefined;
  private _pathname: string | undefined = undefined;
  private _username: string | undefined = undefined;
  private _password: string | undefined = undefined;
  private _origin: string | undefined = undefined;
  private _protocol: string | undefined = undefined;
  private _search: string = "";
  private _query: Record<string, unknown> = {};

  constructor(
    private readonly req: NextRequest,
    private readonly _route: string,
    private readonly _params: Record<string, string>,
  ) {
    this.extract();
  }

  private extract() {
    this.req.headers.forEach((value, key) => {
      this._headers[key] = value;
    });

    this._cookie = Cookie.from(this.req);
    this._method = this.req.method.toUpperCase() as NapiMethod;
    this._url = this.req.url;
    this._mode = this.req.mode;
    this._href = this.req.nextUrl.href;
    this._schema = this._headers["x-forwarded-proto"];
    this._userAgent = this._headers["user-agent"];
    this._pathname = this.req.nextUrl.pathname;
    this._hostname = this.req.nextUrl.hostname;
    this._port = this.req.nextUrl.port ? Number(this.req.nextUrl.port) : undefined;
    this._host = this.req.nextUrl.host;
    this._origin = this.req.nextUrl.origin;
    this._protocol = this.req.nextUrl.protocol;
    this._search = this.req.nextUrl.search;
    this._query = parse(this._search);
  }

  getHeader(name: string) {
    return this._headers[name];
  }

  getCookie(name: string) {
    return this._cookie.get(name);
  }

  json() {
    return this.req.json();
  }

  text() {
    return this.req.text();
  }

  formData() {
    return this.req.formData();
  }

  arrayBuffer() {
    return this.req.arrayBuffer();
  }

  get method() {
    return this._method;
  }

  get headers() {
    return this._headers;
  }

  get cookies() {
    return this._cookie.getAll();
  }

  get url() {
    return this._url;
  }

  get mode() {
    return this._mode;
  }

  get host() {
    return this._host;
  }

  get schema() {
    return this._schema;
  }

  get hostname() {
    return this._hostname;
  }

  get port() {
    return this._port;
  }

  get userAgent() {
    return this._userAgent;
  }

  get href() {
    return this._href;
  }

  get pathname() {
    return this._pathname;
  }

  get path() {
    return this._pathname;
  }

  get username() {
    return this._username;
  }

  get password() {
    return this._password;
  }
  
  get origin() {
    return this._origin;
  }

  get protocol() {
    return this._protocol;
  }

  get search() {
    return this._search;
  }

  get query() {
    return this._query;
  }

  get params() {
    return this._params;
  }

  get route() {
    return this._route;
  }

  get auth() {
    return {
      username: this._username,
      password: this._password,
    };
  }

  get body() {
    const contentType = this._headers["content-type"];

    switch (contentType) {
      case NapiContent.TEXT:
      case NapiContent.ENCODED:
        return this.req.text();
      case NapiContent.MULTIPART:
        return this.req.formData();
      case NapiContent.BINARY:
        return this.req.arrayBuffer();
      default:
        return this.req.json();
    }
  }

  get cookie() {
    return this._cookie;
  }
}