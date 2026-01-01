/**
 * Transform Columns Pipeline Step
 *
 * Transforms and manipulates data columns by renaming, filtering,
 * or applying transformations to specific columns.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PipelineContext } from '../../../interfaces/pipeline-context.interface';
import { PipelineStepHandler } from '../../../interfaces/pipeline-step.interface';
import { StepType } from '../../../entities/pipeline-step.entity';

@Injectable()
export class TransformColumnsStep implements PipelineStepHandler {
  readonly type = StepType.TRANSFORM_COLUMNS;
  readonly name = 'Transform Columns';
  readonly description = 'Transform and manipulate data columns';
  readonly configSchema = {
    transformations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          column: { type: 'string' },
          operation: { type: 'string', enum: ['rename', 'uppercase', 'lowercase', 'trim'] },
          newName: { type: 'string' },
        },
      },
    },
  };

  private readonly logger = new Logger(TransformColumnsStep.name);

  execute(context: PipelineContext, config: any): Observable<any> {
    const { transformations = [] } = config;
    let data = [...context.data];

    for (const transform of transformations) {
      data = this.applyTransformation(data, transform);
    }

    return of(data);
  }

  private applyTransformation(data: any[], transform: any): any[] {
    const { column, operation, newName } = transform;

    return data.map((row) => {
      const newRow = { ...row };

      switch (operation) {
        case 'rename':
          if (newRow[column] !== undefined && newName) {
            newRow[newName] = newRow[column];
            delete newRow[column];
          }
          break;
        case 'uppercase':
          if (typeof newRow[column] === 'string') {
            newRow[column] = newRow[column].toUpperCase();
          }
          break;
        case 'lowercase':
          if (typeof newRow[column] === 'string') {
            newRow[column] = newRow[column].toLowerCase();
          }
          break;
        case 'trim':
          if (typeof newRow[column] === 'string') {
            newRow[column] = newRow[column].trim();
          }
          break;
      }

      return newRow;
    });
  }

  validateConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(config.transformations)) {
      errors.push('transformations must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getDefaultConfig(): any {
    return {
      transformations: [],
    };
  }

  canHandle(data: any, context: PipelineContext): boolean {
    return Array.isArray(data) && data.length > 0;
  }
}
