/**
 * Pipeline Execution Context Interface
 *
 * Defines the context object passed through pipeline execution,
 * containing data, metadata, and execution state.
 */

import { Observable } from 'rxjs';

export interface PipelineContext {
  /** Unique execution identifier */
  executionId: string;

  /** Pipeline identifier */
  pipelineId: string;

  /** Current step being executed */
  currentStepId?: string;

  /** Timestamp when execution started (for performance tracking) */
  startTime: number;

  /** Input data for the current step */
  data: any;

  /** Metadata about the execution */
  metadata: {
    /** Timestamp when execution started */
    startedAt: Date;

    /** User who initiated the execution */
    initiatedBy: string;

    /** Source of the data (file, API, etc.) */
    source?: string;

    /** Additional custom metadata */
    custom?: Record<string, any>;
  };

  /** Execution statistics */
  stats: {
    /** Number of records processed */
    recordsProcessed: number;

    /** Number of records with errors */
    recordsWithErrors: number;

    /** Current progress (0-100) */
    progress: number;

    /** Execution time in milliseconds */
    executionTimeMs: number;
  };

  /** Error information */
  errors: Array<{
    stepId: string;
    recordIndex?: number;
    error: string;
    timestamp: Date;
    data?: any;
  }>;

  /** Variables that can be shared across steps */
  variables: Map<string, any>;

  /** Configuration overrides for steps */
  stepConfigs: Map<string, any>;

  /** Observable for progress updates */
  progress$: Observable<PipelineProgress>;

  /** Observable for log messages */
  logs$: Observable<PipelineLog>;
}

export interface PipelineProgress {
  executionId: string;
  stepId?: string;
  stepName?: string;
  progress: number;
  recordsProcessed: number;
  totalRecords?: number;
  message?: string;
  timestamp: Date;
}

export interface PipelineLog {
  executionId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  stepId?: string;
  data?: any;
  timestamp: Date;
}
