/**
 * Database Configuration
 *
 * Configuration for PostgreSQL database connection used by TypeORM.
 * Supports different environments (development, production) with appropriate settings.
 */

export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.DB_NAME || 'databuddy',
    schema: process.env.DB_SCHEMA || 'public',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 20,
    minConnections: parseInt(process.env.DB_MIN_CONNECTIONS, 10) || 2,
  },
});
