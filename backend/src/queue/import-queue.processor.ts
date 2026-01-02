import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "bullmq";
import { DataImport, ImportStatus } from "../entities/data-import.entity";
import { PipelineRunnerService } from "../modules/pipelines/pipeline-runner.service";
import { ImportJobData } from "./queue.service";

/**
 * Import Queue Processor - Handles background data import processing jobs
 *
 * Processes:
 * - Data import jobs with optional pipeline execution
 */
@Processor("import")
export class ImportQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportQueueProcessor.name);

  constructor(
    @InjectRepository(DataImport)
    private dataImportRepository: Repository<DataImport>,
    private readonly pipelineRunner: PipelineRunnerService,
  ) {
    super();
  }

  /**
   * Process import job
   */
  async process(job: Job<ImportJobData>): Promise<any> {
    const { importId, pipelineId, userId, options } = job.data;

    this.logger.log(
      `Processing import job ${job.id} for import ${importId} by user ${userId}`,
    );

    try {
      const dataImport = await this.dataImportRepository.findOne({
        where: { id: importId },
      });

      if (!dataImport) {
        throw new Error(`Data import ${importId} not found`);
      }

      dataImport.status = ImportStatus.PROCESSING;
      dataImport.metadata = {
        ...dataImport.metadata,
        jobId: job.id as string,
        startedAt: new Date().toISOString(),
      };
      await this.dataImportRepository.save(dataImport);

      this.logger.log(`Import ${importId} - Initializing import`);
      await job.updateProgress(10);

      let processedRows = 0;
      let executionResult: any = null;

      if (pipelineId) {
        this.logger.log(`Import ${importId} - Starting pipeline execution`);
        await job.updateProgress(20);

        const initialData = [
          {
            filePath: dataImport.filePath,
            fileType: dataImport.fileType,
            originalFileName: dataImport.originalFileName,
            importId: dataImport.id,
          },
        ];

        const result = await this.pipelineRunner.execute(
          pipelineId,
          initialData,
        );
        executionResult = result;

        this.logger.log(
          `Import ${importId} - Pipeline execution completed: ${result.processedItems} items`,
        );
        await job.updateProgress(70);

        if (result.success) {
          dataImport.status = ImportStatus.COMPLETED;
          processedRows = result.processedItems;
          this.logger.log(
            `Import ${importId} - Import completed successfully: ${result.processedItems} rows`,
          );
        } else {
          dataImport.status = ImportStatus.FAILED;
          if (result.errors && result.errors.length > 0) {
            if (!dataImport.errors) {
              dataImport.errors = [];
            }
            dataImport.errors.push(
              ...result.errors.map((e) => e.message || String(e)),
            );
          }
          this.logger.error(
            `Import ${importId} - Import failed during pipeline execution`,
          );
        }

        await job.updateProgress(80);
      } else {
        this.logger.log(`Import ${importId} - Basic file processing`);
        processedRows = dataImport.totalRows || 0;
        dataImport.status = ImportStatus.COMPLETED;
        await job.updateProgress(60);
      }

      dataImport.processedRows = processedRows;
      dataImport.completedAt = new Date();
      dataImport.metadata = {
        ...dataImport.metadata,
        completedAt: new Date().toISOString(),
        pipelineId: pipelineId || null,
        executionResult,
        jobId: job.id as string,
      };

      await this.dataImportRepository.save(dataImport);
      await job.updateProgress(100);

      this.logger.log(
        `Import job ${job.id} completed: ${processedRows} rows processed, status: ${dataImport.status}`,
      );

      return {
        success: dataImport.status === ImportStatus.COMPLETED,
        processedRows,
        importId,
        status: dataImport.status,
        errors: dataImport.errors || [],
      };
    } catch (error) {
      this.logger.error(`Import job ${job.id} failed: ${error.message}`);

      try {
        const dataImport = await this.dataImportRepository.findOne({
          where: { id: importId },
        });

        if (dataImport) {
          dataImport.status = ImportStatus.FAILED;
          if (!dataImport.errors) {
            dataImport.errors = [];
          }
          dataImport.errors.push(error.message);
          dataImport.completedAt = new Date();
          await this.dataImportRepository.save(dataImport);
        }
      } catch (updateError) {
        this.logger.error(
          `Failed to update import status: ${updateError.message}`,
        );
      }

      throw error;
    }
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Import job ${job.id} completed successfully`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, err: Error) {
    this.logger.error(`Import job ${job.id} failed with error: ${err.message}`);
  }

  @OnWorkerEvent("progress")
  onProgress(job: Job, progress: number) {
    this.logger.debug(`Import job ${job.id} progress: ${progress}%`);
  }
}
