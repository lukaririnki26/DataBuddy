/**
 * Pipeline Step Interface
 *
 * Defines the contract for pipeline step implementations.
 * Each step type must implement this interface.
 */

import { Observable } from "rxjs";
import { PipelineContext } from "./pipeline-context.interface";
import { StepType } from "../types/step-type";

export interface PipelineStepHandler {
  /**
   * Unique identifier for this step type
   */
  readonly type: StepType;

  /**
   * Human-readable name for this step type
   */
  readonly name: string;

  /**
   * Description of what this step does
   */
  readonly description: string;

  /**
   * Schema for step configuration validation
   */
  readonly configSchema: Record<string, any>;

  /**
   * Schema for expected input data
   */
  readonly inputSchema?: Record<string, any>;

  /**
   * Schema for output data
   */
  readonly outputSchema?: Record<string, any>;

  /**
   * Execute the step with given context and configuration
   * @param context - Pipeline execution context
   * @param config - Step-specific configuration
   * @returns Observable of processed data
   */
  execute(context: PipelineContext, config: any): Observable<any>;

  /**
   * Validate step configuration
   * @param config - Configuration to validate
   * @returns Validation result
   */
  validateConfig(config: any): { isValid: boolean; errors: string[] };

  /**
   * Get default configuration for this step
   */
  getDefaultConfig(): any;

  /**
   * Check if this step can handle the given input data
   * @param data - Input data to check
   * @param context - Pipeline context
   */
  canHandle(data: any, context: PipelineContext): boolean;
}

export interface PipelineStepResult {
  /** Whether the step execution was successful */
  success: boolean;

  /** Processed data */
  data?: any;

  /** Error information if execution failed */
  error?: {
    message: string;
    code?: string;
    details?: any;
  };

  /** Statistics about the execution */
  stats?: {
    recordsProcessed: number;
    recordsWithErrors: number;
    executionTimeMs: number;
  };

  /** Metadata about the result */
  metadata?: Record<string, any>;
}

export interface StepExecutionOptions {
  /** Maximum execution time in milliseconds */
  timeout?: number;

  /** Whether to continue on error */
  continueOnError?: boolean;

  /** Number of retry attempts */
  retryCount?: number;

  /** Delay between retries in milliseconds */
  retryDelay?: number;

  /** Batch size for processing large datasets */
  batchSize?: number;
}
