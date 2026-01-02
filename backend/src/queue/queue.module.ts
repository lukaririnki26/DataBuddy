import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { QueueService } from "./queue.service";
import { QueueController } from "./queue.controller";
import { PipelineQueueProcessor } from "./pipeline-queue.processor";
import { ImportQueueProcessor } from "./import-queue.processor";

/**
 * Queue Module - Handles background job processing using BullMQ
 *
 * Provides async processing for:
 * - Pipeline execution
 * - Data import processing
 * - Heavy data operations
 */
@Module({
  imports: [
    // Register multiple queues
    BullModule.registerQueue(
      {
        name: "pipeline",
        connection: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT) || 6379,
        },
      },
      {
        name: "import",
        connection: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT) || 6379,
        },
      },
    ),
  ],
  controllers: [QueueController],
  providers: [QueueService, PipelineQueueProcessor, ImportQueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
