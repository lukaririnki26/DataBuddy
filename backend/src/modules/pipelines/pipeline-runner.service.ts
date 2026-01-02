/**
 * Pipeline Runner Service
 *
 * Orchestrates the execution of pipeline steps.
 */

import { Injectable, Logger } from "@nestjs/common";
import { NotificationsService } from "../notifications/notifications.service";
import { PipelinesService } from "./pipelines.service";
import { PipelineStepFactory } from "./pipeline-step.factory";
import { PipelineStep } from "../../entities/pipeline-step.entity";

@Injectable()
export class PipelineRunnerService {
  private readonly logger = new Logger(PipelineRunnerService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pipelinesService: PipelinesService,
    private readonly stepFactory: PipelineStepFactory,
  ) { }
  /**
   * Execute a pipeline with input data
   * TODO: Implement full pipeline execution logic
   */
  async execute(
    pipelineId: string,
    inputData?: any[],
  ): Promise<{
    success: boolean;
    processedItems: number;
    errors: any[];
    warnings: any[];
    executionTime: number;
    metadata?: any;
  }> {
    const startTime = Date.now();
    const errors: any[] = [];
    const warnings: any[] = [];
    let currentData = inputData || [];

    // Trigger start notification
    await this.notificationsService.notifyPipelineExecution(
      pipelineId,
      "Pipeline Node",
      "started",
      "system-admin",
    );

    try {
      // Fetch pipeline and steps
      const pipeline = await this.pipelinesService.findOne(pipelineId);

      // Sort steps
      const steps = (pipeline.steps || []).sort((a: PipelineStep, b: PipelineStep) => a.order - b.order);

      if (steps.length === 0) {
        warnings.push("Pipeline has no steps defined.");
      }

      // Execute steps
      for (const step of steps) {
        if (step.status === 'disabled') {
          this.logger.log(`Skipping disabled step: ${step.name}`);
          continue;
        }

        try {
          const processor = this.stepFactory.getProcessor(step.type);

          this.logger.log(`Executing step ${step.order}: ${step.name} (${step.type})`);

          const result = await processor.process(currentData, step.config);

          // If result has data property, use it for next step, otherwise keep currentData or merge
          if (result && result.data && Array.isArray(result.data)) {
            currentData = result.data;
          }

          // Record success (in real app, we'd update step stats in DB)
        } catch (error) {
          const errorMessage = `Step ${step.name} failed: ${error.message}`;
          this.logger.error(errorMessage);
          errors.push({ stepId: step.id, stepName: step.name, error: error.message });

          if (!step.continueOnError) {
            throw new Error(`Pipeline failed at step '${step.name}': ${error.message}`);
          }
        }
      }

    } catch (error) {
      this.logger.error(`Pipeline execution failed: ${error.message}`);
      errors.push({ type: "critical", message: error.message });
    }

    const executionTime = Date.now() - startTime;
    const success = errors.length === 0 || errors.every(e => e.type !== "critical"); // allow non-critical errors if handled

    const result = {
      success,
      processedItems: currentData.length,
      errors,
      warnings,
      executionTime,
      metadata: {
        pipelineId,
        stepsExecuted: "All active steps", // simplified
      },
    };

    // Trigger completion notification
    await this.notificationsService.notifyPipelineExecution(
      pipelineId,
      "Pipeline Node",
      success ? "completed" : "failed",
      "system-admin",
    );

    return result;
  }
}
