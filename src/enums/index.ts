export enum NapiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

export enum NapiContent {
  JSON = 'application/json',
  ENCODED = 'application/x-www-form-urlencoded',
  MULTIPART = 'multipart/form-data',
  TEXT = 'text/plain',
  BINARY = 'application/octet-stream',
  BUFFER = ''
}

export enum NapiHttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  MULTI_STATUS = 207,
  ALREADY_REPORTED = 208,
  IM_USED = 226,
  MULTIPLE_CHOICES = 300,
  MOVED_PERMANENTLY = 301,
  MOVED_TEMPORARILY = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  CONFLICT = 409,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  UNSUPPORTED_MEDIA_TYPE = 415,
  EXPECTATION_FAILED = 417,
  IM_A_TEAPOT = 418,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export enum NapiHttpCode {
  OK = "OK",
  CREATED = "Created",
  ACCEPTED = "Accepted",
  NON_AUTHORITATIVE_INFORMATION = "Non-Authoritative Information",
  NO_CONTENT = "No Content",
  RESET_CONTENT = "Reset Content",
  PARTIAL_CONTENT = "Partial Content",
  MULTI_STATUS = "Multi-Status",
  ALREADY_REPORTED = "Already Reported",
  IM_USED = "IM Used",
  MULTIPLE_CHOICES = "Multiple Choices",
  MOVED_PERMANENTLY = "Moved Permanently",
  MOVED_TEMPORARILY = "Moved Temporarily",
  SEE_OTHER = "See Other",
  NOT_MODIFIED = "Not Modified",
  TEMPORARY_REDIRECT = "Temporary Redirect",
  PERMANENT_REDIRECT = "Permanent Redirect",
  BAD_REQUEST = "Bad Request",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  NOT_FOUND = "Not Found",
  METHOD_NOT_ALLOWED = "Method Not Allowed",
  NOT_ACCEPTABLE = "Not Acceptable",
  CONFLICT = "Conflict",
  LENGTH_REQUIRED = "Length Required",
  PRECONDITION_FAILED = "Precondition Failed",
  UNSUPPORTED_MEDIA_TYPE = "Unsupported Media Type",
  EXPECTATION_FAILED = "Expectation Failed",
  IM_A_TEAPOT = "I'm a teapot",
  UNPROCESSABLE_ENTITY = "Unprocessable Entity",
  TOO_MANY_REQUESTS = "Too Many Requests",
  INTERNAL_SERVER = "Internal Server Error",
  NOT_IMPLEMENTED = "Not Implemented",
  BAD_GATEWAY = "Bad Gateway",
  SERVICE_UNAVAILABLE = "Service Unavailable",
  GATEWAY_TIMEOUT = "Gateway Timeout",
}
