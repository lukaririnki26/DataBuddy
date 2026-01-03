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
import { PipelineExecutionsService } from "./pipeline-executions.service";
import { ExecutionStatus } from "../../entities/pipeline-execution.entity";

@Injectable()
export class PipelineRunnerService {
  private readonly logger = new Logger(PipelineRunnerService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pipelinesService: PipelinesService,
    private readonly stepFactory: PipelineStepFactory,
    private readonly executionsService: PipelineExecutionsService,
  ) { }

  /**
   * Execute a pipeline with input data
   */
  async execute(
    pipelineId: string,
    inputData?: any[],
    userId?: string,
  ): Promise<{
    success: boolean;
    processedItems: number;
    errors: any[];
    warnings: any[];
    executionTime: number;
    metadata?: any;
    executionId?: string;
  }> {
    const startTime = Date.now();
    const errors: any[] = [];
    const warnings: any[] = [];
    let currentData = inputData || [];
    const logs: any[] = [];

    // Create execution record
    let executionRecord;
    if (userId) { // Only log if triggered by a user (or system user in future)
      executionRecord = await this.executionsService.createExecutionRecord(
        pipelineId,
        userId,
        JSON.parse(JSON.stringify(currentData)) // Snapshot input
      );
    }

    // Trigger start notification
    if (userId) {
      await this.notificationsService.notifyPipelineExecution(
        pipelineId,
        "Pipeline Node",
        "started",
        userId,
      );
    }

    try {
      // Fetch pipeline and steps
      const pipeline = await this.pipelinesService.findOne(pipelineId);

      // Sort steps
      const steps = (pipeline.steps || []).sort((a: PipelineStep, b: PipelineStep) => a.order - b.order);

      if (steps.length === 0) {
        warnings.push("Pipeline has no steps defined.");
        logs.push({ level: 'warn', message: "Pipeline has no steps defined." });
      }

      // Execute steps
      for (const step of steps) {
        if (step.status === 'disabled') {
          this.logger.log(`Skipping disabled step: ${step.name}`);
          logs.push({ level: 'info', message: `Skipping disabled step: ${step.name}`, stepId: step.id });
          continue;
        }

        try {
          const processor = this.stepFactory.getProcessor(step.type);
          this.logger.log(`Executing step ${step.order}: ${step.name} (${step.type})`);
          logs.push({ level: 'info', message: `Executing step ${step.order}: ${step.name}`, stepId: step.id });

          const stepStartTime = Date.now();
          const result = await processor.process(currentData, step.config);
          logs.push({
            level: 'info',
            message: `Step ${step.name} completed in ${Date.now() - stepStartTime}ms`,
            stepId: step.id,
            outputSummary: result?.message
          });

          // If result has data property, use it for next step
          if (result && result.data && Array.isArray(result.data)) {
            currentData = result.data;
          }

        } catch (error) {
          const errorMessage = `Step ${step.name} failed: ${error.message}`;
          this.logger.error(errorMessage);
          errors.push({ stepId: step.id, stepName: step.name, error: error.message });
          logs.push({ level: 'error', message: errorMessage, stepId: step.id });

          if (!step.continueOnError) {
            throw new Error(`Pipeline failed at step '${step.name}': ${error.message}`);
          }
        }
      }

    } catch (error) {
      this.logger.error(`Pipeline execution failed: ${error.message}`);
      errors.push({ type: "critical", message: error.message });
      logs.push({ level: 'critical', message: `Pipeline execution failed: ${error.message}` });
    }

    const executionTime = Date.now() - startTime;
    const success = errors.length === 0 || errors.every(e => e.type !== "critical");

    const result = {
      success,
      processedItems: currentData.length,
      errors,
      warnings,
      executionTime,
      metadata: {
        pipelineId,
        stepsExecuted: "All active steps",
      },
      executionId: executionRecord?.id
    };

    // Update execution record
    if (executionRecord) {
      await this.executionsService.finishExecution(
        executionRecord.id,
        success ? ExecutionStatus.COMPLETED : ExecutionStatus.FAILED,
        JSON.parse(JSON.stringify(currentData)), // Snapshot output
        logs,
        errors.length > 0 ? JSON.stringify(errors) : undefined
      );
    }

    // Trigger completion notification
    if (userId) {
      await this.notificationsService.notifyPipelineExecution(
        pipelineId,
        "Pipeline Node",
        success ? "completed" : "failed",
        userId,
        { executionId: executionRecord?.id }
      );
    }

    return result;
  }
}
