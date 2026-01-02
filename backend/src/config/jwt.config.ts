/**
 * JWT Configuration
 *
 * Configuration for JSON Web Token authentication including secret keys,
 * expiration times, and refresh token settings.
 */

export default () => ({
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "your-refresh-token-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: process.env.JWT_ISSUER || "databuddy-api",
    audience: process.env.JWT_AUDIENCE || "databuddy-users",
  },
});
