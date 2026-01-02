/**
 * JWT Authentication Guard
 *
 * Protects routes by validating JWT tokens and extracting user information
 * from the request for authenticated endpoints.
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    // Add custom logic here if needed
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Custom error handling
    if (err || !user) {
      throw err || new UnauthorizedException("Invalid or missing JWT token");
    }
    return user;
  }
}
