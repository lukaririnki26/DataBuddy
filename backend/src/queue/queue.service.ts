import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface PipelineJobData {
  pipelineId: string;
  inputData?: any[];
  userId: string;
  options?: Record<string, any>;
}

export interface ImportJobData {
  importId: string;
  pipelineId?: string;
  userId: string;
  options?: Record<string, any>;
}

export interface ExportJobData {
  exportConfig: {
    pipelineId?: string;
    format: 'csv' | 'xlsx' | 'json';
    filename: string;
    filters?: Record<string, any>;
  };
  userId: string;
  options?: Record<string, any>;
}

/**
 * Queue Service - Provides interface for managing background jobs
 *
 * Handles job queuing for:
 * - Pipeline execution
 * - Data import processing
 * - Data export processing
 */
@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('pipeline') private readonly pipelineQueue: Queue,
    @InjectQueue('import') private readonly importQueue: Queue,
  ) {}

  /**
   * Add pipeline execution job to queue
   */
  async addPipelineJob(data: PipelineJobData): Promise<string> {
    try {
      const job = await this.pipelineQueue.add(
        'execute-pipeline',
        data,
        {
          priority: data.options?.priority || 0,
          delay: data.options?.delay || 0,
          attempts: data.options?.maxRetries || 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 5, // Keep last 5 failed jobs
        }
      );

      this.logger.log(`Pipeline job added to queue: ${job.id} for pipeline ${data.pipelineId}`);
      return job.id;
    } catch (error) {
      this.logger.error(`Failed to add pipeline job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add import processing job to queue
   */
  async addImportJob(data: ImportJobData): Promise<string> {
    try {
      const job = await this.importQueue.add(
        'process-import',
        data,
        {
          priority: 5, // Higher priority for imports
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 20,
          removeOnFail: 10,
        }
      );

      this.logger.log(`Import job added to queue: ${job.id} for import ${data.importId}`);
      return job.id;
    } catch (error) {
      this.logger.error(`Failed to add import job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add export processing job to queue
   */
  async addExportJob(data: ExportJobData): Promise<string> {
    try {
      const job = await this.pipelineQueue.add(
        'process-export',
        data,
        {
          priority: 3, // Medium priority for exports
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: 15,
          removeOnFail: 8,
        }
      );

      this.logger.log(`Export job added to queue: ${job.id} for user ${data.userId}`);
      return job.id;
    } catch (error) {
      this.logger.error(`Failed to add export job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName: string, jobId: string): Promise<any> {
    try {
      const queue = queueName === 'pipeline' ? this.pipelineQueue : this.importQueue;
      const job = await queue.getJob(jobId);

      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const progress = job.progress;
      const finishedOn = job.finishedOn;
      const processedOn = job.processedOn;

      return {
        id: job.id,
        status: state,
        progress,
        data: job.data,
        opts: job.opts,
        attemptsMade: job.attemptsMade,
        finishedOn,
        processedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue,
      };
    } catch (error) {
      this.logger.error(`Failed to get job status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<any> {
    try {
      const queue = queueName === 'pipeline' ? this.pipelineQueue : this.importQueue;

      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      return {
        queueName,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get queue stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up old completed jobs
   */
  async cleanOldJobs(queueName: string, grace: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const queue = queueName === 'pipeline' ? this.pipelineQueue : this.importQueue;

      await queue.clean(grace, 100, 'completed');
      await queue.clean(grace, 50, 'failed');

      this.logger.log(`Cleaned old jobs from ${queueName} queue`);
    } catch (error) {
      this.logger.error(`Failed to clean old jobs: ${error.message}`);
      throw error;
    }
  }
}
