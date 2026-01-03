/**
 * TypeORM DataSource Configuration
 *
 * DataSource instance for TypeORM CLI operations (migrations, seeders).
 */

import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Pipeline } from "../entities/pipeline.entity";
import { PipelineStep } from "../entities/pipeline-step.entity";
import { DataImport } from "../entities/data-import.entity";
import { DataExport } from "../entities/data-export.entity";
import { PipelineExecution } from "../entities/pipeline-execution.entity";
import { Notification } from "../entities/notification.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432", 10),
  username: process.env.DATABASE_USERNAME || "postgres",
  password: process.env.DATABASE_PASSWORD || "postgres",
  database: process.env.DATABASE_NAME || "databuddy",
  schema: process.env.DB_SCHEMA || "public",
  ssl: process.env.DB_SSL === "true",
  synchronize: false, // Never use synchronize in production
  logging: process.env.NODE_ENV === "development",
  entities: [User, Pipeline, PipelineStep, DataImport, DataExport, PipelineExecution, Notification],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
