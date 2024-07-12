import { HTTPError } from "./http-error";

export class UnauthorizedError extends HTTPError {
  constructor(message = "Please log in to access this resource.") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
