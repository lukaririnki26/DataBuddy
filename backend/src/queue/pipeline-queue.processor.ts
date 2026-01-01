import { Processor } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PipelineRunnerService } from '../../modules/pipelines/pipeline-runner.service';
import { DataBuddyWebSocketGateway } from '../websocket/websocket.gateway';
import { PipelineJobData, ExportJobData } from './queue.service';

/**
 * Pipeline Queue Processor - Handles background pipeline execution jobs
 *
 * Processes:
 * - Pipeline execution jobs
 * - Data export jobs
 */
@Injectable()
@Processor('pipeline')
export class PipelineQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(PipelineQueueProcessor.name);

  constructor(
    private readonly pipelineRunner: PipelineRunnerService,
    private readonly websocketGateway: DataBuddyWebSocketGateway,
  ) {
    super();
  }

  /**
   * Process pipeline execution job
   */
  async process(job: Job<PipelineJobData>): Promise<any> {
    const { pipelineId, inputData, userId, options } = job.data;

    const executionId = `exec_${Date.now()}_${job.id}`;

    this.logger.log(`Processing pipeline job ${job.id} for pipeline ${pipelineId} by user ${userId}`);

    try {
      // Emit initial progress
      this.websocketGateway.emitPipelineProgress(pipelineId, executionId, userId, {
        status: 'started',
        progress: 10,
        currentStep: 'Initializing pipeline execution',
      });

      // Update job progress
      await job.updateProgress(10);

      // Execute the pipeline
      const result = await this.pipelineRunner.execute(pipelineId, inputData);

      // Emit execution progress
      this.websocketGateway.emitPipelineProgress(pipelineId, executionId, userId, {
        status: 'running',
        progress: 80,
        currentStep: 'Pipeline execution in progress',
        processedItems: result.processedItems,
      });

      await job.updateProgress(80);

      // Log completion
      this.logger.log(
        `Pipeline job ${job.id} completed: ${result.processedItems} items processed, ` +
        `${result.errors.length} errors, ${result.warnings.length} warnings`
      );

      await job.updateProgress(100);

      // Emit completion
      this.websocketGateway.emitPipelineCompleted(pipelineId, executionId, userId, {
        success: result.success,
        processedItems: result.processedItems,
        errors: result.errors,
        warnings: result.warnings,
        executionTime: result.executionTime,
        metadata: result.metadata,
      });

      return {
        success: result.success,
        processedItems: result.processedItems,
        errors: result.errors,
        warnings: result.warnings,
        executionTime: result.executionTime,
        metadata: result.metadata,
      };

    } catch (error) {
      this.logger.error(`Pipeline job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process export job
   */
  async processExport(job: Job<ExportJobData>): Promise<any> {
    const { exportConfig, userId, options } = job.data;

    this.logger.log(`Processing export job ${job.id} for user ${userId}`);

    try {
      await job.updateProgress(10);

      // Execute pipeline for export
      const result = await this.pipelineRunner.execute(exportConfig.pipelineId!, [{
        exportFormat: exportConfig.format,
        exportFilename: exportConfig.filename,
        filters: exportConfig.filters,
        userId,
      }]);

      await job.updateProgress(90);

      this.logger.log(`Export job ${job.id} completed: ${result.processedItems} items exported`);

      await job.updateProgress(100);

      return {
        success: result.success,
        exportedItems: result.processedItems,
        exportFormat: exportConfig.format,
        filename: exportConfig.filename,
        errors: result.errors,
        warnings: result.warnings,
      };

    } catch (error) {
      this.logger.error(`Export job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle job completion
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  /**
   * Handle job failure
   */
  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
  }

  /**
   * Handle job progress updates
   */
  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`Job ${job.id} progress: ${progress}%`);
  }

  /**
   * Handle active job events
   */
  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} is now active`);
  }
}
