/**
 * Data Import Entity
 *
 * Represents a data import operation in the system. Tracks the progress,
 * status, and metadata of importing data from various sources (files, APIs, etc.).
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
} from "typeorm";
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from "class-validator";
import { User } from "./user.entity";

export enum ImportStatus {
  PENDING = "pending", // Import job created, waiting to start
  PROCESSING = "processing", // Import is currently running
  VALIDATING = "validating", // Data validation in progress
  TRANSFORMING = "transforming", // Data transformation in progress
  COMPLETED = "completed", // Import completed successfully
  FAILED = "failed", // Import failed with errors
  CANCELLED = "cancelled", // Import was cancelled by user
}

export enum ImportSourceType {
  FILE_UPLOAD = "file_upload", // Direct file upload
  URL_DOWNLOAD = "url_download", // Download from URL
  API_ENDPOINT = "api_endpoint", // Data from API
  DATABASE_QUERY = "database_query", // Data from database query
  STREAM = "stream", // Real-time data stream
}

export enum FileFormat {
  CSV = "csv",
  XLSX = "xlsx",
  XLS = "xls",
  JSON = "json",
  XML = "xml",
  TXT = "txt",
}

@Entity("data_imports")
@Index(["createdBy", "status"])
@Index(["status", "createdAt"])
@Index(["sourceType", "fileFormat"])
export class DataImport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 200 })
  @IsString()
  name: string;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({
    type: "enum",
    enum: ImportStatus,
    default: ImportStatus.PENDING,
  })
  @IsEnum(ImportStatus)
  status: ImportStatus;

  @Column({
    type: "enum",
    enum: ImportSourceType,
  })
  @IsEnum(ImportSourceType)
  sourceType: ImportSourceType;

  @Column({
    type: "enum",
    enum: FileFormat,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(FileFormat)
  fileFormat?: FileFormat;

  @Column({ type: "varchar", length: 500, nullable: true })
  @IsOptional()
  @IsString()
  sourcePath?: string; // File path, URL, API endpoint, etc.

  @Column({ type: "varchar", length: 500, nullable: true })
  @IsOptional()
  @IsString()
  originalFileName?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  @IsOptional()
  @IsString()
  filePath?: string; // Local file path after upload

  @Column({ type: "varchar", length: 255, nullable: true })
  @IsOptional()
  @IsString()
  filename?: string; // Processed filename

  @Column({ type: "varchar", length: 100, nullable: true })
  @IsOptional()
  @IsString()
  mimeType?: string; // MIME type of the file

  @Column({ type: "bigint", nullable: true })
  @IsOptional()
  @Min(0)
  fileSize?: number; // File size in bytes

  @Column({ type: "jsonb", nullable: true })
  importConfig?: Record<string, any>; // Import-specific configuration

  @Column({ type: "jsonb", nullable: true })
  dataPreview?: Record<string, any>; // Sample of imported data

  @Column({ type: "int", default: 0 })
  totalRows: number; // Total rows in the dataset

  @Column({ type: "int", default: 0 })
  processedRows: number; // Rows successfully processed

  @Column({ type: "int", default: 0 })
  errorRows: number; // Rows with errors

  @Column({ type: "int", default: 0 })
  skippedRows: number; // Rows skipped (duplicates, filters, etc.)

  @Column({ type: "jsonb", nullable: true })
  columnMapping?: Record<string, any>; // Column mapping configuration

  @Column({ type: "jsonb", nullable: true })
  validationRules?: Record<string, any>; // Data validation rules

  @Column({ type: "jsonb", nullable: true })
  transformationRules?: Record<string, any>; // Data transformation rules

  @Column({ type: "varchar", length: 100, nullable: true })
  targetTable?: string; // Target database table name

  @Column({ type: "text", nullable: true })
  errorMessage?: string; // Error message if import failed

  @Column({ type: "jsonb", nullable: true })
  errorDetails?: Record<string, any>; // Detailed error information

  @Column({ type: "float", nullable: true })
  progressPercentage?: number; // Progress as percentage (0-100)

  @Column({ type: "timestamp", nullable: true })
  startedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @Column({ type: "float", nullable: true })
  durationSeconds?: number; // Total execution time

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>; // Additional metadata

  @Column({ type: "jsonb", nullable: true })
  errors?: string[]; // Array of error messages

  @Column({ type: "jsonb", nullable: true })
  columns?: string[]; // Array of column names from import

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column({ type: "uuid" })
  @IsUUID()
  createdById: string;

  // Virtual properties
  get isPending(): boolean {
    return this.status === ImportStatus.PENDING;
  }

  get isProcessing(): boolean {
    return [
      ImportStatus.PROCESSING,
      ImportStatus.VALIDATING,
      ImportStatus.TRANSFORMING,
    ].includes(this.status);
  }

  get isCompleted(): boolean {
    return this.status === ImportStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === ImportStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this.status === ImportStatus.CANCELLED;
  }

  get successRate(): number {
    if (this.totalRows === 0) return 0;
    return (this.processedRows / this.totalRows) * 100;
  }

  get errorRate(): number {
    if (this.totalRows === 0) return 0;
    return (this.errorRows / this.totalRows) * 100;
  }

  // Alias for fileFormat (for backward compatibility)
  get fileType(): FileFormat | undefined {
    return this.fileFormat;
  }

  // Methods
  start() {
    this.status = ImportStatus.PROCESSING;
    this.startedAt = new Date();
    this.progressPercentage = 0;
  }

  complete() {
    this.status = ImportStatus.COMPLETED;
    this.completedAt = new Date();
    this.progressPercentage = 100;

    if (this.startedAt) {
      this.durationSeconds =
        (this.completedAt.getTime() - this.startedAt.getTime()) / 1000;
    }
  }

  fail(errorMessage: string, errorDetails?: any) {
    this.status = ImportStatus.FAILED;
    this.errorMessage = errorMessage;
    this.errorDetails = errorDetails;
    this.completedAt = new Date();

    if (this.startedAt) {
      this.durationSeconds =
        (this.completedAt.getTime() - this.startedAt.getTime()) / 1000;
    }
  }

  cancel() {
    this.status = ImportStatus.CANCELLED;
    this.completedAt = new Date();

    if (this.startedAt) {
      this.durationSeconds =
        (this.completedAt.getTime() - this.startedAt.getTime()) / 1000;
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

  incrementSkippedRows(count: number = 1) {
    this.skippedRows += count;
  }

  setValidationStatus() {
    this.status = ImportStatus.VALIDATING;
  }

  setTransformingStatus() {
    this.status = ImportStatus.TRANSFORMING;
  }

  // Add error details
  addErrorDetails(rowNumber: number, error: string, data?: any) {
    if (!this.errorDetails) {
      this.errorDetails = {};
    }

    if (!this.errorDetails.errors) {
      this.errorDetails.errors = [];
    }

    this.errorDetails.errors.push({
      rowNumber,
      error,
      data,
      timestamp: new Date(),
    });

    this.incrementErrorRows();
  }

  // Get import summary
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      sourceType: this.sourceType,
      fileFormat: this.fileFormat,
      progressPercentage: this.progressPercentage,
      totalRows: this.totalRows,
      processedRows: this.processedRows,
      errorRows: this.errorRows,
      skippedRows: this.skippedRows,
      successRate: this.successRate,
      errorRate: this.errorRate,
      durationSeconds: this.durationSeconds,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }
}
