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
import { PipelineExecution } from "../../entities/pipeline-execution.entity";
import { PipelinesService } from "./pipelines.service";
import { PipelineRunnerService } from "./pipeline-runner.service";
import { PipelineStepFactory } from "./pipeline-step.factory";
import { NotificationsModule } from "../notifications/notifications.module";
import { PipelinesController } from "./pipelines.controller";
import { PipelineExecutionsService } from "./pipeline-executions.service";
import { PipelineExecutionsController, PipelineHistoryController } from "./pipeline-executions.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pipeline,
      PipelineStep,
      PipelineExecution
    ]),
    BullModule.registerQueue({
      name: "pipeline",
    }),
    NotificationsModule,
  ],
  controllers: [
    PipelinesController,
    PipelineExecutionsController,
    PipelineHistoryController
  ],
  providers: [
    PipelinesService,
    PipelineRunnerService,
    PipelineStepFactory,
    PipelineExecutionsService
  ],
  exports: [PipelinesService, PipelineExecutionsService],
})
export class PipelinesModule { }
