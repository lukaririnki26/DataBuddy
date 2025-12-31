import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { DataImport, ImportStatus } from '../common/entities/data-import.entity';
import { PipelineRunnerService } from '../pipelines/pipeline-runner.service';
import { DataBuddyWebSocketGateway } from '../websocket/websocket.gateway';
import { ImportJobData } from './queue.service';

/**
 * Import Queue Processor - Handles background data import processing jobs
 *
 * Processes:
 * - Data import jobs with optional pipeline execution
 */
@Injectable()
@Processor('import')
export class ImportQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportQueueProcessor.name);

  constructor(
    @InjectRepository(DataImport)
    private dataImportRepository: Repository<DataImport>,
    private readonly pipelineRunner: PipelineRunnerService,
    private readonly websocketGateway: DataBuddyWebSocketGateway,
  ) {
    super();
  }

  /**
   * Process import job
   */
  async process(job: Job<ImportJobData>): Promise<any> {
    const { importId, pipelineId, userId, options } = job.data;

    this.logger.log(`Processing import job ${job.id} for import ${importId} by user ${userId}`);

    try {
      // Get the import record
      const dataImport = await this.dataImportRepository.findOne({
        where: { id: importId },
      });

      if (!dataImport) {
        throw new Error(`Data import ${importId} not found`);
      }

      // Update status to processing
      dataImport.status = ImportStatus.PROCESSING;
      dataImport.metadata = {
        ...dataImport.metadata,
        jobId: job.id,
        startedAt: new Date().toISOString(),
      };
      await this.dataImportRepository.save(dataImport);

      // Emit initial progress update
      this.websocketGateway.emitImportProgress(importId, userId, {
        status: 'processing',
        progress: 10,
        currentStep: 'Initializing import',
      });

      await job.updateProgress(10);

      let processedRows = 0;
      let executionResult: any = null;

      if (pipelineId) {
        // Emit pipeline start
        this.websocketGateway.emitImportProgress(importId, userId, {
          status: 'processing',
          progress: 20,
          currentStep: 'Starting pipeline execution',
        });

        await job.updateProgress(20);

        // Execute pipeline with file data
        const initialData = [{
          filePath: dataImport.filePath,
          fileType: dataImport.fileType,
          originalFilename: dataImport.originalFilename,
          importId: dataImport.id,
        }];

        const result = await this.pipelineRunner.execute(pipelineId, initialData);
        executionResult = result;

        // Emit pipeline progress
        this.websocketGateway.emitImportProgress(importId, userId, {
          status: 'processing',
          progress: 70,
          currentStep: 'Pipeline execution completed',
          processedRows: result.processedItems,
        });

        await job.updateProgress(70);

        if (result.success) {
          dataImport.status = ImportStatus.COMPLETED;
          processedRows = result.processedItems;

          // Emit success
          this.websocketGateway.emitImportProgress(importId, userId, {
            status: 'completed',
            progress: 90,
            processedRows: result.processedItems,
            currentStep: 'Import completed successfully',
          });
        } else {
          dataImport.status = ImportStatus.FAILED;
          dataImport.errors = result.errors;

          // Emit failure
          this.websocketGateway.emitImportProgress(importId, userId, {
            status: 'failed',
            progress: 90,
            errors: result.errors,
            currentStep: 'Import failed during pipeline execution',
          });
        }

        await job.updateProgress(80);
      } else {
        // Basic file processing
        try {
          processedRows = await this.processFileBasic(dataImport);
          dataImport.status = ImportStatus.COMPLETED;
          await job.updateProgress(60);
        } catch (error) {
          dataImport.status = ImportStatus.FAILED;
          dataImport.errors = [error.message];
        }
      }

      // Update final results
      dataImport.processedRows = processedRows;
      dataImport.completedAt = new Date();
      dataImport.metadata = {
        ...dataImport.metadata,
        completedAt: new Date().toISOString(),
        pipelineId: pipelineId || null,
        executionResult,
        jobId: job.id,
      };

      await this.dataImportRepository.save(dataImport);
      await job.updateProgress(100);

      this.logger.log(
        `Import job ${job.id} completed: ${processedRows} rows processed, status: ${dataImport.status}`
      );

      // Emit final completion notification
      this.websocketGateway.emitImportCompleted(importId, userId, {
        success: dataImport.status === ImportStatus.COMPLETED,
        processedRows,
        totalRows: processedRows, // We don't have total from basic processing
        errors: dataImport.errors || [],
        warnings: [],
        executionTime: Date.now() - new Date(dataImport.createdAt).getTime(),
        metadata: dataImport.metadata,
      });

      return {
        success: dataImport.status === ImportStatus.COMPLETED,
        processedRows,
        importId,
        status: dataImport.status,
        errors: dataImport.errors,
      };

    } catch (error) {
      this.logger.error(`Import job ${job.id} failed: ${error.message}`);

      // Update import status to failed
      try {
        const dataImport = await this.dataImportRepository.findOne({
          where: { id: importId },
        });

        if (dataImport) {
          dataImport.status = ImportStatus.FAILED;
          dataImport.errors = [...(dataImport.errors || []), error.message];
          dataImport.completedAt = new Date();
          await this.dataImportRepository.save(dataImport);
        }
      } catch (updateError) {
        this.logger.error(`Failed to update import status: ${updateError.message}`);
      }

      throw error;
    }
  }

  /**
   * Basic file processing without pipeline
   */
  private async processFileBasic(dataImport: DataImport): Promise<number> {
    const fs = require('fs');

    // Check if file exists
    if (!fs.existsSync(dataImport.filePath)) {
      throw new Error(`File not found: ${dataImport.filePath}`);
    }

    const stats = fs.statSync(dataImport.filePath);
    let rowCount = 0;

    try {
      if (dataImport.fileType === 'csv') {
        // For CSV, count lines (approximate row count)
        const content = fs.readFileSync(dataImport.filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        rowCount = Math.max(0, lines.length - 1); // Subtract header row
      } else if (dataImport.fileType === 'xlsx') {
        // For Excel, we'd need to read the file to count rows
        const XLSX = require('xlsx');
        const workbook = XLSX.readFile(dataImport.filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (worksheet) {
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          rowCount = range.e.r - range.s.r; // Approximate row count
        }
      }

      // Update metadata
      dataImport.metadata = {
        ...dataImport.metadata,
        fileSize: stats.size,
        estimatedRows: rowCount,
        processedWithoutPipeline: true,
      };

      return rowCount;

    } catch (error) {
      throw new Error(`File processing failed: ${error.message}`);
    }
  }

  /**
   * Handle job completion
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Import job ${job.id} completed successfully`);
  }

  /**
   * Handle job failure
   */
  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Import job ${job.id} failed with error: ${err.message}`);
  }

  /**
   * Handle job progress updates
   */
  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`Import job ${job.id} progress: ${progress}%`);
  }
}
