/**
 * Request With User Interface
 *
 * Extends the standard Express Request interface to include
 * authenticated user information attached by authentication middleware.
 */

import { Request } from "express";
import { User } from "../../entities/user.entity";

export interface RequestWithUser extends Request {
  /** Authenticated user attached by JWT strategy */
  user: User;

  /** JWT token payload */
  jwtPayload?: import("./jwt-payload.interface").JwtPayload;
}
