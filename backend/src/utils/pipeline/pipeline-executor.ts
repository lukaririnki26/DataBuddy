/**
 * Pipeline Executor
 *
 * Orchestrates the execution of data processing pipelines by coordinating
 * pipeline steps and managing data flow between them.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { PipelineContext } from '../../interfaces/pipeline-context.interface';
import { PipelineStepResult } from '../../interfaces/pipeline-step.interface';

@Injectable()
export class PipelineExecutor {
  private readonly logger = new Logger(PipelineExecutor.name);

  /**
   * Execute a pipeline step with given context and configuration
   */
  executeStep(
    stepHandler: any,
    context: PipelineContext,
    config: any,
  ): Observable<PipelineStepResult> {
    this.logger.debug(`Executing step: ${stepHandler.type}`);

    try {
      return stepHandler.execute(context, config).pipe(
        map((data: any) => ({
          success: true,
          data,
          stats: {
            recordsProcessed: Array.isArray(data) ? data.length : 1,
            recordsWithErrors: 0,
            executionTimeMs: Date.now() - context.startTime,
          },
        })),
        catchError((error) => {
          this.logger.error(`Step execution failed: ${error.message}`, error.stack);
          return of({
            success: false,
            error: {
              message: error.message,
              code: 'STEP_EXECUTION_FAILED',
              details: error,
            },
            stats: {
              recordsProcessed: 0,
              recordsWithErrors: 1,
              executionTimeMs: Date.now() - context.startTime,
            },
          });
        }),
      );
    } catch (error) {
      this.logger.error(`Step initialization failed: ${error.message}`, error.stack);
      return throwError(() => error);
    }
  }

  /**
   * Execute a complete pipeline with all its steps
   */
  executePipeline(
    steps: any[],
    initialContext: PipelineContext,
  ): Observable<PipelineStepResult[]> {
    const results: PipelineStepResult[] = [];
    let currentContext = { ...initialContext };

    // Execute steps sequentially
    const executionChain = steps.reduce((chain, step) => {
      return chain.pipe(
        switchMap((previousResult: PipelineStepResult | null) => {
          if (previousResult) {
            results.push(previousResult);
            // Update context with previous step's output
            currentContext.data = previousResult.data;
          }

          return this.executeStep(step.handler, currentContext, step.config);
        }),
      );
    }, of(null as PipelineStepResult | null));

    return executionChain.pipe(
      map((finalResult: PipelineStepResult | null) => {
        if (finalResult) {
          results.push(finalResult);
        }
        return results;
      }),
    );
  }
}
