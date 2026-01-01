/**
 * Data Export Entity
 *
 * Represents a data export operation in the system. Tracks the progress,
 * status, and metadata of exporting data to various formats and destinations.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IsString, IsEnum, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { User } from './user.entity';
import { FileFormat } from './data-import.entity';

export enum ExportStatus {
  PENDING = 'pending',      // Export job created, waiting to start
  PROCESSING = 'processing', // Export is currently running
  COMPLETED = 'completed',   // Export completed successfully
  FAILED = 'failed',        // Export failed with errors
  CANCELLED = 'cancelled',  // Export was cancelled by user
}

export enum ExportDestinationType {
  FILE_DOWNLOAD = 'file_download',  // Direct file download
  EMAIL_ATTACHMENT = 'email_attachment', // Send via email
  FTP_UPLOAD = 'ftp_upload',      // Upload to FTP server
  API_ENDPOINT = 'api_endpoint',  // Send to API endpoint
  CLOUD_STORAGE = 'cloud_storage', // Upload to cloud storage (S3, GCS, etc.)
}

@Entity('data_exports')
@Index(['createdBy', 'status'])
@Index(['status', 'createdAt'])
@Index(['destinationType', 'fileFormat'])
export class DataExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  @IsString()
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({
    type: 'enum',
    enum: ExportStatus,
    default: ExportStatus.PENDING,
  })
  @IsEnum(ExportStatus)
  status: ExportStatus;

  @Column({
    type: 'enum',
    enum: ExportDestinationType,
  })
  @IsEnum(ExportDestinationType)
  destinationType: ExportDestinationType;

  @Column({
    type: 'enum',
    enum: FileFormat,
  })
  fileFormat: FileFormat;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  destinationPath?: string; // File path, email, API endpoint, etc.

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  outputFileName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  filename?: string; // Processed filename

  @Column({ type: 'jsonb', nullable: true })
  exportConfig?: Record<string, any>; // Export-specific configuration

  @Column({ type: 'jsonb', nullable: true })
  dataQuery?: Record<string, any>; // Query/filter configuration for data selection

  @Column({ type: 'int', default: 0 })
  totalRows: number; // Total rows to export

  @Column({ type: 'int', default: 0 })
  processedRows: number; // Rows successfully exported

  @Column({ type: 'int', default: 0 })
  errorRows: number; // Rows with errors during export

  @Column({ type: 'bigint', nullable: true })
  @IsOptional()
  @Min(0)
  outputFileSize?: number; // Output file size in bytes

  @Column({ type: 'jsonb', nullable: true })
  columnSelection?: Record<string, any>; // Which columns to include/exclude

  @Column({ type: 'jsonb', nullable: true })
  transformationRules?: Record<string, any>; // Data transformation rules before export

  @Column({ type: 'varchar', length: 100, nullable: true })
  sourceTable?: string; // Source database table name

  @Column({ type: 'text', nullable: true })
  errorMessage?: string; // Error message if export failed

  @Column({ type: 'jsonb', nullable: true })
  errorDetails?: Record<string, any>; // Detailed error information

  @Column({ type: 'float', nullable: true })
  progressPercentage?: number; // Progress as percentage (0-100)

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'float', nullable: true })
  durationSeconds?: number; // Total execution time

  @Column({ type: 'varchar', length: 500, nullable: true })
  downloadUrl?: string; // URL for downloading the exported file (temporary)

  @Column({ type: 'timestamp', nullable: true })
  downloadUrlExpiresAt?: Date; // When the download URL expires

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid' })
  @IsUUID()
  createdById: string;

  // Virtual properties
  get isPending(): boolean {
    return this.status === ExportStatus.PENDING;
  }

  get isProcessing(): boolean {
    return this.status === ExportStatus.PROCESSING;
  }

  get isCompleted(): boolean {
    return this.status === ExportStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === ExportStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this.status === ExportStatus.CANCELLED;
  }

  get successRate(): number {
    if (this.totalRows === 0) return 0;
    return ((this.processedRows / this.totalRows) * 100);
  }

  get downloadUrlIsValid(): boolean {
    if (!this.downloadUrl || !this.downloadUrlExpiresAt) {
      return false;
    }
    return new Date() < this.downloadUrlExpiresAt;
  }

  // Methods
  start() {
    this.status = ExportStatus.PROCESSING;
    this.startedAt = new Date();
    this.progressPercentage = 0;
  }

  complete(outputFileSize?: number, downloadUrl?: string, expiresAt?: Date) {
    this.status = ExportStatus.COMPLETED;
    this.completedAt = new Date();
    this.progressPercentage = 100;

    if (outputFileSize !== undefined) {
      this.outputFileSize = outputFileSize;
    }

    if (downloadUrl) {
      this.downloadUrl = downloadUrl;
      this.downloadUrlExpiresAt = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    if (this.startedAt) {
      this.durationSeconds = (this.completedAt.getTime() - this.startedAt.getTime()) / 1000;
    }
  }

  fail(errorMessage: string, errorDetails?: any) {
    this.status = ExportStatus.FAILED;
    this.errorMessage = errorMessage;
    this.errorDetails = errorDetails;
    this.completedAt = new Date();

    if (this.startedAt) {
      this.durationSeconds = (this.completedAt.getTime() - this.startedAt.getTime()) / 1000;
    }
  }

  cancel() {
    this.status = ExportStatus.CANCELLED;
    this.completedAt = new Date();

    if (this.startedAt) {
      this.durationSeconds = (this.completedAt.getTime() - this.startedAt.getTime()) / 1000;
    }
  }

  updateProgress(processedRows: number, totalRows?: number) {
    this.processedRows = processedRows;
    if (totalRows !== undefined) {
      this.totalRows = totalRows;
    }

    if (this.totalRows > 0) {
      this.progressPercentage = (this.processedRows / this.totalRows) * 100;
    }
  }

  incrementErrorRows(count: number = 1) {
    this.errorRows += count;
  }

  setDownloadUrl(url: string, expiresInHours: number = 24) {
    this.downloadUrl = url;
    this.downloadUrlExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  }

  clearDownloadUrl() {
    this.downloadUrl = null;
    this.downloadUrlExpiresAt = null;
  }

  // Get export summary
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      destinationType: this.destinationType,
      fileFormat: this.fileFormat,
      progressPercentage: this.progressPercentage,
      totalRows: this.totalRows,
      processedRows: this.processedRows,
      errorRows: this.errorRows,
      successRate: this.successRate,
      durationSeconds: this.durationSeconds,
      downloadUrl: this.downloadUrlIsValid ? this.downloadUrl : null,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }
}
