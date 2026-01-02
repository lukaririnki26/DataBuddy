/**
 * Roles Decorator
 *
 * Decorator to specify required roles for accessing controllers or methods.
 * Used in combination with RolesGuard for role-based access control.
 */

import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../entities/user.entity";

/**
 * Decorator to set required roles for a controller method or class
 * @param roles - Array of roles that are allowed to access the resource
 */
export const Roles = (...roles: UserRole[]) => SetMetadata("roles", roles);

/**
 * Convenience decorators for common role combinations
 */
export const AdminOnly = () => Roles(UserRole.ADMIN);
export const EditorOrAbove = () => Roles(UserRole.EDITOR, UserRole.ADMIN);
export const ViewerOrAbove = () =>
  Roles(UserRole.VIEWER, UserRole.EDITOR, UserRole.ADMIN);
export const AuthenticatedOnly = () => Roles(); // Any authenticated user
