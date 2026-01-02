/**
 * Roles Guard
 *
 * Authorizes users based on their assigned roles for accessing protected resources.
 * Works in conjunction with the @Roles() decorator and JwtAuthGuard.
 */

import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../entities/user.entity";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user || !user.role) {
      return false; // User not authenticated or no role assigned
    }

    return requiredRoles.includes(user.role);
  }
}
