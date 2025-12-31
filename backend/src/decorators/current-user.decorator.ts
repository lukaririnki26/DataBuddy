/**
 * Current User Decorator
 *
 * Parameter decorator to inject the currently authenticated user
 * into controller method parameters.
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/auth/request-with-user.interface';
import { User } from '../entities/user.entity';

/**
 * Parameter decorator that extracts the authenticated user from the request
 * @param data - Optional property to extract from user object
 * @param ctx - Execution context
 * @returns User object or specific user property
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Return specific property if requested
    if (data && user) {
      return user[data];
    }

    return user;
  },
);
