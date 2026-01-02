/**
 * Redis Configuration
 *
 * Configuration for Redis connection used by BullMQ queues,
 * caching, and session management.
 */

export default () => ({
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || "",
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || "databuddy:",
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY, 10) || 3000,
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES, 10) || 3,
  },
});
