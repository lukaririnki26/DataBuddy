/**
 * DataBuddy App Module - Root Application Module
 *
 * This is the root module of the DataBuddy application that imports all
 * feature modules and configures global services like database, Redis,
 * authentication, and task queues.
 */

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { BullModule } from "@nestjs/bullmq";

// Import all feature modules
import { AuthModule } from "./modules/auth/auth.module";
import { PipelinesModule } from "./modules/pipelines/pipelines.module";
import { DataModule } from "./modules/data/data.module";
import { MonitoringModule } from "./modules/monitoring/monitoring.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { UsersModule } from "./modules/users/users.module";

// Import entities
import { User } from "./entities/user.entity";
import { Pipeline } from "./entities/pipeline.entity";
import { PipelineStep } from "./entities/pipeline-step.entity";
import { DataImport } from "./entities/data-import.entity";
import { DataExport } from "./entities/data-export.entity";
import { Notification } from "./entities/notification.entity";
import { PipelineExecution } from "./entities/pipeline-execution.entity";

// Import configuration
import databaseConfig from "./config/database.config";
import jwtConfig from "./config/jwt.config";
import redisConfig from "./config/redis.config";

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig],
      envFilePath: [".env.local", ".env"],
    }),

    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("database.host"),
        port: configService.get("database.port"),
        username: configService.get("database.username"),
        password: configService.get("database.password"),
        database: configService.get("database.name"),
        entities: [
          User,
          Pipeline,
          PipelineStep,
          DataImport,
          DataExport,
          Notification,
          PipelineExecution,
        ],
        synchronize: configService.get("NODE_ENV") !== "production", // Auto-sync in dev only
        logging: configService.get("NODE_ENV") === "development",
        ssl: configService.get("NODE_ENV") === "production",
      }),
      inject: [ConfigService],
    }),

    // JWT configuration
    JwtModule.registerAsync({
      global: true, // Correct property name
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("jwt.secret"),
        signOptions: {
          expiresIn: configService.get("jwt.expiresIn"),
        },
      }),
      inject: [ConfigService],
    }),

    // Redis/Bull queue configuration
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          connection: {
            host: configService.get("redis.host"),
            port: configService.get("redis.port"),
            password: configService.get("redis.password"),
          },
        };
      },
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    PipelinesModule,
    DataModule,
    MonitoringModule,
    MonitoringModule,
    NotificationsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
