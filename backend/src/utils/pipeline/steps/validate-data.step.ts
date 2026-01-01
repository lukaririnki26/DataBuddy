/**
 * Validate Data Pipeline Step
 *
 * Validates data against predefined rules and constraints,
 * ensuring data quality before further processing.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PipelineContext } from '../../../interfaces/pipeline-context.interface';
import { PipelineStepHandler } from '../../../interfaces/pipeline-step.interface';
import { StepType } from '../../../entities/pipeline-step.entity';

@Injectable()
export class ValidateDataStep implements PipelineStepHandler {
  readonly type = StepType.FILTER_ROWS;
  readonly name = 'Validate Data';
  readonly description = 'Validate data against rules and constraints';
  readonly configSchema = {
    rules: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          column: { type: 'string' },
          rule: { type: 'string', enum: ['required', 'email', 'numeric', 'minLength'] },
          value: { type: 'any' },
        },
      },
    },
    failOnError: { type: 'boolean', default: false },
  };

  private readonly logger = new Logger(ValidateDataStep.name);

  execute(context: PipelineContext, config: any): Observable<any> {
    const { rules = [], failOnError = false } = config;
    const data = [...context.data];
    const validData: any[] = [];
    const invalidData: any[] = [];

    for (const row of data) {
      const isValid = this.validateRow(row, rules);

      if (isValid || !failOnError) {
        validData.push(row);
      } else {
        invalidData.push(row);
      }
    }

    this.logger.debug(`Validated ${data.length} rows: ${validData.length} valid, ${invalidData.length} invalid`);

    return of(validData);
  }

  private validateRow(row: any, rules: any[]): boolean {
    for (const rule of rules) {
      const { column, rule: ruleType, value } = rule;
      const fieldValue = row[column];

      if (!this.validateField(fieldValue, ruleType, value)) {
        return false;
      }
    }

    return true;
  }

  private validateField(value: any, ruleType: string, ruleValue: any): boolean {
    switch (ruleType) {
      case 'required':
        return value !== null && value !== undefined && value !== '';

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof value === 'string' && emailRegex.test(value);

      case 'numeric':
        return !isNaN(Number(value));

      case 'minLength':
        return typeof value === 'string' && value.length >= ruleValue;

      default:
        return true;
    }
  }

  validateConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(config.rules)) {
      errors.push('rules must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getDefaultConfig(): any {
    return {
      rules: [],
      failOnError: false,
    };
  }

  canHandle(data: any, context: PipelineContext): boolean {
    return Array.isArray(data) && data.length > 0;
  }
}
