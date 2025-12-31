/**
 * JWT Payload Interface
 *
 * Defines the structure of JWT token payload used for authentication.
 * Contains user identification and basic information.
 */

export interface JwtPayload {
  /** User unique identifier */
  sub: string;

  /** User email address */
  email: string;

  /** User role for authorization */
  role: string;

  /** Token type (access or refresh) */
  type?: 'access' | 'refresh';

  /** Token issued at timestamp */
  iat?: number;

  /** Token expiration timestamp */
  exp?: number;

  /** Token issuer */
  iss?: string;

  /** Token audience */
  aud?: string;
}
