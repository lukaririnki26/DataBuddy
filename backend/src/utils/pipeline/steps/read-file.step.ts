/**
 * Read File Pipeline Step
 *
 * Reads data from various file formats (CSV, Excel, JSON) and converts
 * it into a standardized data structure for further processing.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { PipelineContext } from '../../../interfaces/pipeline-context.interface';
import { PipelineStepHandler, PipelineStepResult } from '../../../interfaces/pipeline-step.interface';
import { StepType } from '../../../entities/pipeline-step.entity';

@Injectable()
export class ReadFileStep implements PipelineStepHandler {
  readonly type = StepType.READ_FILE;
  readonly name = 'Read File';
  readonly description = 'Read data from CSV, Excel, or JSON files';
  readonly configSchema = {
    filePath: { type: 'string', required: true },
    fileFormat: { type: 'string', enum: ['csv', 'xlsx', 'json'], required: true },
    encoding: { type: 'string', default: 'utf8' },
    hasHeaders: { type: 'boolean', default: true },
    delimiter: { type: 'string', default: ',' },
    sheetName: { type: 'string', default: 'Sheet1' },
  };

  private readonly logger = new Logger(ReadFileStep.name);

  execute(context: PipelineContext, config: any): Observable<any> {
    return from(this.processFile(config));
  }

  private async processFile(config: any): Promise<any[]> {
    const { filePath, fileFormat, encoding = 'utf8' } = config;

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    switch (fileFormat.toLowerCase()) {
      case 'csv':
        return this.readCsvFile(filePath, config);
      case 'xlsx':
        return this.readExcelFile(filePath, config);
      case 'json':
        return this.readJsonFile(filePath, encoding);
      default:
        throw new Error(`Unsupported file format: ${fileFormat}`);
    }
  }

  private async readCsvFile(filePath: string, config: any): Promise<any[]> {
    const { hasHeaders = true, delimiter = ',', encoding = 'utf8' } = config;
    const results: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath, { encoding: encoding as BufferEncoding })
        .pipe(csv({
          separator: delimiter,
          headers: hasHeaders ? undefined : false,
        }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private async readExcelFile(filePath: string, config: any): Promise<any[]> {
    const { sheetName = 'Sheet1', hasHeaders = true } = config;

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Sheet '${sheetName}' not found in Excel file`);
    }

    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: hasHeaders ? 1 : undefined,
      defval: '',
    });

    return Array.isArray(data) ? data : [data];
  }

  private async readJsonFile(filePath: string, encoding: string): Promise<any[]> {
    const content = fs.readFileSync(filePath, { encoding: encoding as BufferEncoding });
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
        return data;
    } else {
      return [data];
    }
  }

  validateConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.filePath) {
      errors.push('filePath is required');
    }

    if (!config.fileFormat) {
      errors.push('fileFormat is required');
    } else if (!['csv', 'xlsx', 'json'].includes(config.fileFormat.toLowerCase())) {
      errors.push('fileFormat must be one of: csv, xlsx, json');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getDefaultConfig(): any {
    return {
      encoding: 'utf8',
      hasHeaders: true,
      delimiter: ',',
      sheetName: 'Sheet1',
    };
  }

  canHandle(data: any, context: PipelineContext): boolean {
    // This is a source step, so it doesn't need input data
    return true;
  }
}
