export class HTTPError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "HTTPError";
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
