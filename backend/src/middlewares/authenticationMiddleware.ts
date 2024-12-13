import { Request, Response, NextFunction } from "express";

// checks if there is a user object added to the request object
function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (request.user) {
    next();
    return;
  }

  response.sendStatus(401);
}

export default authenticationMiddleware;
