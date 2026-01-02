/**
 * Pipelines Module
 *
 * Handles data pipeline management and execution.
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { Pipeline } from "../../entities/pipeline.entity";
import { PipelineStep } from "../../entities/pipeline-step.entity";
import { PipelinesService } from "./pipelines.service";
import { PipelineRunnerService } from "./pipeline-runner.service";
import { PipelineStepFactory } from "./pipeline-step.factory";
import { NotificationsModule } from "../notifications/notifications.module";
import { PipelinesController } from "./pipelines.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Pipeline, PipelineStep]),
    BullModule.registerQueue({
      name: "pipeline",
    }),
    NotificationsModule,
  ],
  controllers: [PipelinesController],
  providers: [PipelinesService, PipelineRunnerService, PipelineStepFactory],
  exports: [PipelinesService, PipelineRunnerService, PipelineStepFactory],
})
export class PipelinesModule { }
