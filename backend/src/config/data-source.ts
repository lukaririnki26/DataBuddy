/**
 * TypeORM DataSource Configuration
 *
 * DataSource instance for TypeORM CLI operations (migrations, seeders).
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'databuddy',
  schema: process.env.DB_SCHEMA || 'public',
  ssl: process.env.DB_SSL === 'true',
  synchronize: false, // Never use synchronize in production
  logging: process.env.NODE_ENV === 'development',
  entities: [
    'src/entities/**/*.entity.ts',
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
