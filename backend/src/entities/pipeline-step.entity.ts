/**
 * Pipeline Step Entity
 *
 * Represents an individual step within a data processing pipeline.
 * Each step performs a specific operation on the data as it flows through the pipeline.
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
import { Pipeline } from './pipeline.entity';

export enum StepType {
  // Data Input/Output
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  READ_API = 'read_api',
  WRITE_API = 'write_api',

  // Data Transformation
  TRANSFORM_COLUMNS = 'transform_columns',
  FILTER_ROWS = 'filter_rows',
  SORT_DATA = 'sort_data',
  GROUP_DATA = 'group_data',
  JOIN_DATASETS = 'join_datasets',

  // Data Validation & Cleaning
  VALIDATE_DATA = 'validate_data',
  CLEAN_DATA = 'clean_data',
  REMOVE_DUPLICATES = 'remove_duplicates',
  FILL_MISSING_VALUES = 'fill_missing_values',

  // Data Analysis
  AGGREGATE_DATA = 'aggregate_data',
  CALCULATE_METRICS = 'calculate_metrics',
  APPLY_FORMULA = 'apply_formula',

  // Custom/Advanced
  CUSTOM_SCRIPT = 'custom_script',
  CONDITIONAL_BRANCH = 'conditional_branch',
  LOOP_ITERATION = 'loop_iteration',
}

export enum StepStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ERROR = 'error',
}

@Entity('pipeline_steps')
@Index(['pipeline', 'order'])
@Index(['type', 'status'])
export class PipelineStep {
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
    enum: StepType,
  })
  @IsEnum(StepType)
  type: StepType;

  @Column({
    type: 'enum',
    enum: StepStatus,
    default: StepStatus.ACTIVE,
  })
  @IsEnum(StepStatus)
  status: StepStatus;

  @Column({ type: 'int' })
  @Min(1)
  @Max(1000)
  order: number; // Execution order within the pipeline

  @Column({ type: 'jsonb' })
  config: Record<string, any>; // Step-specific configuration

  @Column({ type: 'jsonb', nullable: true })
  inputMapping?: Record<string, any>; // How input data maps to this step

  @Column({ type: 'jsonb', nullable: true })
  outputMapping?: Record<string, any>; // How this step outputs data

  @Column({ type: 'jsonb', nullable: true })
  conditions?: Record<string, any>; // Conditional execution rules

  @Column({ type: 'boolean', default: false })
  continueOnError: boolean; // Whether to continue pipeline if this step fails

  @Column({ type: 'int', default: 0 })
  retryCount: number; // Number of retries on failure

  @Column({ type: 'int', nullable: true })
  timeoutSeconds?: number; // Step execution timeout

  @Column({ type: 'bigint', default: 0 })
  executionCount: number; // Number of times this step has been executed

  @Column({ type: 'float', nullable: true })
  averageExecutionTime?: number; // Average execution time in seconds

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt?: Date;

  @Column({ type: 'text', nullable: true })
  lastErrorMessage?: string; // Last error message from execution

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Pipeline, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pipelineId' })
  pipeline: Pipeline;

  @Column({ type: 'uuid' })
  @IsUUID()
  pipelineId: string;

  // Virtual properties
  get isActive(): boolean {
    return this.status === StepStatus.ACTIVE;
  }

  get isDisabled(): boolean {
    return this.status === StepStatus.DISABLED;
  }

  get hasError(): boolean {
    return this.status === StepStatus.ERROR;
  }

  // Methods
  incrementExecutionCount(executionTime?: number) {
    this.executionCount += 1;
    this.lastExecutedAt = new Date();

    if (executionTime !== undefined) {
      // Update rolling average
      const totalTime = (this.averageExecutionTime || 0) * (this.executionCount - 1) + executionTime;
      this.averageExecutionTime = totalTime / this.executionCount;
    }
  }

  setError(errorMessage: string) {
    this.status = StepStatus.ERROR;
    this.lastErrorMessage = errorMessage;
  }

  clearError() {
    this.status = StepStatus.ACTIVE;
    this.lastErrorMessage = null;
  }

  disable() {
    this.status = StepStatus.DISABLED;
  }

  enable() {
    this.status = StepStatus.ACTIVE;
    this.lastErrorMessage = null;
  }

  // Validate step configuration
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name?.trim()) {
      errors.push('Step name is required');
    }

    if (!this.type) {
      errors.push('Step type is required');
    }

    if (!this.config || typeof this.config !== 'object') {
      errors.push('Step configuration is required and must be an object');
    }

    if (this.order < 1) {
      errors.push('Step order must be greater than 0');
    }

    // Type-specific validation
    switch (this.type) {
      case StepType.READ_FILE:
        if (!this.config.filePath && !this.config.fileUrl) {
          errors.push('File path or URL is required for READ_FILE step');
        }
        break;

      case StepType.WRITE_FILE:
        if (!this.config.outputPath) {
          errors.push('Output path is required for WRITE_FILE step');
        }
        break;

      case StepType.READ_API:
        if (!this.config.apiUrl) {
          errors.push('API URL is required for READ_API step');
        }
        break;

      case StepType.CUSTOM_SCRIPT:
        if (!this.config.script) {
          errors.push('Script code is required for CUSTOM_SCRIPT step');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Clone step for pipeline duplication
  clone(): Partial<PipelineStep> {
    return {
      name: `${this.name} (Copy)`,
      description: this.description,
      type: this.type,
      config: { ...this.config },
      inputMapping: { ...this.inputMapping },
      outputMapping: { ...this.outputMapping },
      conditions: { ...this.conditions },
      continueOnError: this.continueOnError,
      retryCount: this.retryCount,
      timeoutSeconds: this.timeoutSeconds,
    };
  }

  // Check if step should execute based on conditions
  shouldExecute(inputData?: any): boolean {
    if (!this.conditions || !inputData) {
      return true;
    }

    // Simple condition evaluation (can be extended for complex logic)
    try {
      for (const [key, condition] of Object.entries(this.conditions)) {
        const value = this.getNestedValue(inputData, key);
        if (!this.evaluateCondition(value, condition)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.warn(`Condition evaluation failed for step ${this.id}:`, error);
      return true; // Default to executing if condition evaluation fails
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluateCondition(value: any, condition: any): boolean {
    if (typeof condition === 'object') {
      const { operator, operand } = condition;
      switch (operator) {
        case 'equals':
          return value === operand;
        case 'not_equals':
          return value !== operand;
        case 'greater_than':
          return value > operand;
        case 'less_than':
          return value < operand;
        case 'contains':
          return String(value).includes(String(operand));
        case 'exists':
          return value !== undefined && value !== null;
        case 'not_exists':
          return value === undefined || value === null;
        default:
          return true;
      }
    }
    return value === condition;
  }
}
