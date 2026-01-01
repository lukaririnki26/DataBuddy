/**
 * Pipeline Entity
 *
 * Represents a data processing pipeline that can be executed on datasets.
 * Pipelines are modular and reusable, consisting of multiple steps that
 * process data in sequence.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { IsString, IsEnum, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';
import { User } from './user.entity';
import { PipelineStep } from './pipeline-step.entity';

export enum PipelineStatus {
  DRAFT = 'draft',          // Pipeline is being created/edited
  ACTIVE = 'active',        // Pipeline is ready to be executed
  ARCHIVED = 'archived',    // Pipeline is archived (soft delete)
}

export enum PipelineType {
  IMPORT = 'import',        // Data import pipeline
  EXPORT = 'export',        // Data export pipeline
  TRANSFORM = 'transform',  // Data transformation pipeline
  HYBRID = 'hybrid',        // Mixed pipeline type
}

@Entity('pipelines')
@Index(['createdBy', 'status'])
@Index(['type', 'status'])
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({
    type: 'enum',
    enum: PipelineType,
    default: PipelineType.TRANSFORM,
  })
  @IsEnum(PipelineType)
  type: PipelineType;

  @Column({
    type: 'enum',
    enum: PipelineStatus,
    default: PipelineStatus.DRAFT,
  })
  @IsEnum(PipelineStatus)
  status: PipelineStatus;

  @Column({ type: 'jsonb', nullable: true })
  config?: Record<string, any>; // Pipeline-level configuration

  @Column({ type: 'jsonb', nullable: true })
  inputSchema?: Record<string, any>; // Expected input data schema

  @Column({ type: 'jsonb', nullable: true })
  outputSchema?: Record<string, any>; // Expected output data schema

  @Column({ type: 'int', default: 0 })
  version: number; // Version number for pipeline updates

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean; // Whether this pipeline can be used as a template

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string; // Pipeline category for organization

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[]; // Tags for search and filtering

  @Column({ type: 'int', default: 0 })
  executionCount: number; // Number of times this pipeline has been executed

  @Column({ type: 'bigint', default: 0 })
  totalProcessedRows: number; // Total rows processed across all executions

  @Column({ type: 'float', nullable: true })
  averageExecutionTime?: number; // Average execution time in seconds

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt?: Date;

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

  @OneToMany(() => PipelineStep, (step) => step.pipeline, { cascade: true })
  steps: PipelineStep[];

  // Virtual properties
  get isActive(): boolean {
    return this.status === PipelineStatus.ACTIVE;
  }

  get isDraft(): boolean {
    return this.status === PipelineStatus.DRAFT;
  }

  // Alias for createdBy for backward compatibility
  get creator(): User {
    return this.createdBy;
  }

  get isArchived(): boolean {
    return this.status === PipelineStatus.ARCHIVED;
  }

  // Methods
  incrementExecutionCount(executionTime?: number, processedRows?: number) {
    this.executionCount += 1;
    this.lastExecutedAt = new Date();

    if (executionTime !== undefined) {
      // Update rolling average
      const totalTime = (this.averageExecutionTime || 0) * (this.executionCount - 1) + executionTime;
      this.averageExecutionTime = totalTime / this.executionCount;
    }

    if (processedRows !== undefined) {
      this.totalProcessedRows += processedRows;
    }
  }

  archive() {
    this.status = PipelineStatus.ARCHIVED;
  }

  activate() {
    this.status = PipelineStatus.ACTIVE;
  }

  // Clone pipeline for editing (creates new version)
  clone(newName?: string): Partial<Pipeline> {
    return {
      name: newName || `${this.name} (Copy)`,
      description: this.description,
      type: this.type,
      config: { ...this.config },
      inputSchema: { ...this.inputSchema },
      outputSchema: { ...this.outputSchema },
      version: this.version + 1,
      category: this.category,
      tags: [...(this.tags || [])],
      isTemplate: false, // Clones are not templates by default
    };
  }

  // Get pipeline steps in execution order
  getOrderedSteps(): PipelineStep[] {
    return this.steps?.sort((a, b) => a.order - b.order) || [];
  }

  // Validate pipeline configuration
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name?.trim()) {
      errors.push('Pipeline name is required');
    }

    if (!this.steps?.length) {
      errors.push('Pipeline must have at least one step');
    }

    // Check for duplicate step orders
    const orders = this.steps?.map(s => s.order) || [];
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      errors.push('Pipeline steps must have unique order numbers');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
