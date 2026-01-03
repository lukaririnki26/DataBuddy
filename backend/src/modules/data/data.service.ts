/**
 * Data Service
 *
 * Service untuk mengelola operasi data di DataBuddy termasuk:
 * - Upload dan parsing file (Excel, CSV)
 * - Validasi dan preview data
 * - Export data dalam berbagai format
 * - Queue management untuk operasi berat
 */

import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import * as XLSX from "xlsx";
import csv = require("csv-parser");
import { createReadStream, promises as fs } from "fs";
import { DataImport, ImportStatus } from "../../entities/data-import.entity";
import { DataExport, ExportStatus } from "../../entities/data-export.entity";
import { User } from "../../entities/user.entity";
import { NotificationsService } from "../notifications/notifications.service";

export interface FileUploadResult {
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  preview: any[];
}

export interface DataValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    column: string;
    value: any;
    error: string;
  }>;
  warnings: Array<{
    row: number;
    column: string;
    message: string;
  }>;
}

export interface ExportOptions {
  format: "csv" | "xlsx" | "json";
  columns?: string[];
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);
  private readonly uploadPath = "./uploads";

  constructor(
    @InjectRepository(DataImport)
    private dataImportRepository: Repository<DataImport>,
    @InjectRepository(DataExport)
    private dataExportRepository: Repository<DataExport>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue("import-queue")
    private importQueue: Queue,
    @InjectQueue("export-queue")
    private exportQueue: Queue,
    private notificationsService: NotificationsService,
  ) {
    // Pastikan direktori upload ada
    this.ensureUploadDirectory();
  }

  /**
   * Memastikan direktori upload tersedia
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Upload dan parsing file data
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    options: {
      hasHeader?: boolean;
      encoding?: string;
      separator?: string;
    } = {},
  ): Promise<FileUploadResult> {
    try {
      const fileId = this.generateFileId();
      const filePath = `${this.uploadPath}/${fileId}_${file.originalname}`;

      // Simpan file ke disk
      await fs.writeFile(filePath, file.buffer);

      // Parse file berdasarkan tipe
      const parsedData = await this.parseFile(file, options);

      // Buat record import di database
      const dataImport = this.dataImportRepository.create({
        name: file.originalname,
        filename: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        rowCount: parsedData.rowCount,
        columnCount: parsedData.columnCount,
        columns: parsedData.columns,
        status: ImportStatus.PENDING,
        createdById: userId,
        metadata: {
          hasHeader: options.hasHeader ?? true,
          encoding: options.encoding || "utf8",
          separator: options.separator || ",",
        },
      } as any);

      await this.dataImportRepository.save(dataImport);

      // Kirim notifikasi
      await this.notificationsService.notifyDataOperation(
        "import",
        "started",
        userId,
        {
          fileId: (dataImport as any).id,
          filename: file.originalname,
          rowCount: parsedData.rowCount,
        },
      );

      return {
        fileId: (dataImport as any).id,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        rowCount: parsedData.rowCount,
        columnCount: parsedData.columnCount,
        columns: parsedData.columns,
        preview: parsedData.preview,
      };
    } catch (error) {
      this.logger.error("File upload failed:", error);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Parse file berdasarkan tipe (Excel/CSV)
   */
  private async parseFile(
    file: Express.Multer.File,
    options: any,
  ): Promise<{
    rowCount: number;
    columnCount: number;
    columns: string[];
    preview: any[];
    data: any[];
  }> {
    const mimeType = file.mimetype.toLowerCase();

    if (mimeType.includes("csv") || mimeType.includes("text")) {
      return this.parseCSV(file.buffer, options);
    } else if (
      mimeType.includes("excel") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("xlsx") ||
      mimeType.includes("xls")
    ) {
      return this.parseExcel(file.buffer, options);
    } else {
      throw new BadRequestException(
        "Unsupported file type. Please upload CSV or Excel files.",
      );
    }
  }

  /**
   * Parse file CSV
   */
  private async parseCSV(
    buffer: Buffer,
    options: any,
  ): Promise<{
    rowCount: number;
    columnCount: number;
    columns: string[];
    preview: any[];
    data: any[];
  }> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      let detectedHeaders: string[] = [];
      const separator = options.separator || ",";

      const stream = require("stream");
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      bufferStream
        .pipe(
          csv({
            separator,
            mapHeaders: ({ header }) => header.trim(),
          }),
        )
        .on("headers", (headers) => {
          detectedHeaders = headers;
        })
        .on("data", (data) => results.push(data))
        .on("end", () => {
          if (results.length === 0 && detectedHeaders.length === 0) {
            throw new BadRequestException("File appears to be empty");
          }

          const columns = detectedHeaders.length > 0 ? detectedHeaders : (results.length > 0 ? Object.keys(results[0]) : []);
          const preview = results.slice(0, 5); // Preview 5 baris pertama

          resolve({
            rowCount: results.length,
            columnCount: columns.length,
            columns,
            preview,
            data: results,
          });
        })
        .on("error", reject);
    });
  }

  /**
   * Parse file Excel
   */
  private async parseExcel(
    buffer: Buffer,
    options: any,
  ): Promise<{
    rowCount: number;
    columnCount: number;
    columns: string[];
    preview: any[];
    data: any[];
  }> {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert ke JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: options.hasHeader ? 1 : undefined,
        defval: "",
      });

      if (jsonData.length === 0) {
        throw new BadRequestException("Excel file appears to be empty");
      }

      let columns: string[];
      let data: any[];

      if (options.hasHeader) {
        // Header ada, gunakan baris pertama sebagai header
        columns = Object.keys(jsonData[0] as object);
        data = jsonData as any[];
      } else {
        // Tidak ada header, buat header otomatis
        const firstRow = jsonData[0] as any;
        columns = Object.keys(firstRow).map(
          (_, index) => `Column_${index + 1}`,
        );
        data = jsonData.map((row: any) => {
          const newRow: any = {};
          Object.keys(row).forEach((key, index) => {
            newRow[`Column_${index + 1}`] = row[key];
          });
          return newRow;
        });
      }

      const preview = data.slice(0, 5);

      return {
        rowCount: data.length,
        columnCount: columns.length,
        columns,
        preview,
        data,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse Excel file: ${error.message}`,
      );
    }
  }

  /**
   * Validasi data berdasarkan rules
   */
  async validateData(
    fileId: string,
    validationRules: {
      requiredColumns?: string[];
      dataTypes?: Record<string, "string" | "number" | "date" | "boolean">;
      customRules?: Array<{
        column: string;
        rule: string;
        message: string;
      }>;
    },
  ): Promise<DataValidationResult> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: fileId },
    });

    if (!dataImport) {
      throw new BadRequestException("Data import not found");
    }

    // Baca file dan parse data
    const fileBuffer = await fs.readFile(dataImport.filePath);
    const parsedData = await this.parseFile(
      {
        buffer: fileBuffer,
        originalname: dataImport.filename,
        mimetype: dataImport.mimeType,
        size: dataImport.fileSize,
      } as Express.Multer.File,
      dataImport.metadata,
    );

    const errors: Array<{
      row: number;
      column: string;
      value: any;
      error: string;
    }> = [];

    const warnings: Array<{
      row: number;
      column: string;
      message: string;
    }> = [];

    // Validasi required columns
    if (validationRules.requiredColumns) {
      for (const requiredColumn of validationRules.requiredColumns) {
        if (!parsedData.columns.includes(requiredColumn)) {
          errors.push({
            row: 0,
            column: requiredColumn,
            value: null,
            error: "Required column is missing",
          });
        }
      }
    }

    // Validasi data types dan custom rules
    parsedData.data.forEach((row, rowIndex) => {
      // Validasi data types
      if (validationRules.dataTypes) {
        for (const [column, expectedType] of Object.entries(
          validationRules.dataTypes,
        )) {
          if (
            row[column] !== undefined &&
            row[column] !== null &&
            row[column] !== ""
          ) {
            const actualValue = row[column];
            const isValidType = this.validateDataType(
              actualValue,
              expectedType,
            );

            if (!isValidType) {
              errors.push({
                row: rowIndex + 1,
                column,
                value: actualValue,
                error: `Expected ${expectedType}, got ${typeof actualValue}`,
              });
            }
          }
        }
      }

      // Validasi custom rules
      if (validationRules.customRules) {
        for (const customRule of validationRules.customRules) {
          try {
            const value = row[customRule.column];
            const isValid = this.evaluateCustomRule(value, customRule.rule);

            if (!isValid) {
              errors.push({
                row: rowIndex + 1,
                column: customRule.column,
                value,
                error: customRule.message,
              });
            }
          } catch (error) {
            warnings.push({
              row: rowIndex + 1,
              column: customRule.column,
              message: `Failed to evaluate custom rule: ${error.message}`,
            });
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validasi tipe data
   */
  private validateDataType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && !isNaN(value);
      case "date":
        return !isNaN(Date.parse(value));
      case "boolean":
        return (
          typeof value === "boolean" || value === "true" || value === "false"
        );
      default:
        return true;
    }
  }

  /**
   * Evaluasi custom rule (untuk validasi sederhana)
   */
  private evaluateCustomRule(value: any, rule: string): boolean {
    // Implementasi sederhana untuk custom rules
    // Dalam implementasi nyata, bisa menggunakan library seperti json-logic

    if (rule.startsWith("min:")) {
      const min = parseFloat(rule.split(":")[1]);
      return typeof value === "number" && value >= min;
    }

    if (rule.startsWith("max:")) {
      const max = parseFloat(rule.split(":")[1]);
      return typeof value === "number" && value <= max;
    }

    if (rule.startsWith("regex:")) {
      const pattern = rule.split(":")[1];
      return new RegExp(pattern).test(String(value));
    }

    if (rule.startsWith("in:")) {
      const allowedValues = rule.split(":")[1].split(",");
      return allowedValues.includes(String(value));
    }

    return true;
  }

  /**
   * Export data berdasarkan opsi
   */
  async exportData(
    data: any[],
    options: ExportOptions,
    userId: string,
    filename?: string,
  ): Promise<string> {
    try {
      // Filter dan sort data jika diperlukan
      let processedData = [...data];

      if (options.filters) {
        processedData = this.applyFilters(processedData, options.filters);
      }

      if (options.sortBy) {
        processedData = this.sortData(
          processedData,
          options.sortBy,
          options.sortOrder || "asc",
        );
      }

      if (options.columns) {
        processedData = processedData.map((row) =>
          options.columns!.reduce((acc, col) => {
            acc[col] = row[col];
            return acc;
          }, {} as any),
        );
      }

      // Generate file berdasarkan format
      const exportId = this.generateFileId();
      const baseFilename = filename || `export_${exportId}`;
      let filePath: string;
      let mimeType: string;

      switch (options.format) {
        case "csv":
          filePath = await this.exportToCSV(processedData, baseFilename);
          mimeType = "text/csv";
          break;
        case "xlsx":
          filePath = await this.exportToExcel(processedData, baseFilename);
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        case "json":
          filePath = await this.exportToJSON(processedData, baseFilename);
          mimeType = "application/json";
          break;
        default:
          throw new BadRequestException("Unsupported export format");
      }

      // Simpan record export ke database
      const dataExport = this.dataExportRepository.create({
        name: baseFilename,
        filename: `${baseFilename}.${options.format}`,
        filePath,
        fileSize: await this.getFileSize(filePath),
        mimeType,
        rowCount: processedData.length,
        columnCount: Object.keys(processedData[0] || {}).length,
        columns: options.columns || Object.keys(processedData[0] || {}),
        format: options.format,
        status: ExportStatus.COMPLETED,
        createdById: userId,
        exportedAt: new Date(),
        metadata: options,
      } as any);

      await this.dataExportRepository.save(dataExport);

      // Kirim notifikasi
      await this.notificationsService.notifyDataOperation(
        "export",
        "completed",
        userId,
        {
          exportId: (dataExport as any).id,
          filename: (dataExport as any).filename,
          rowCount: processedData.length,
          format: options.format,
        },
      );

      return filePath;
    } catch (error) {
      this.logger.error("Data export failed:", error);
      throw new BadRequestException(`Data export failed: ${error.message}`);
    }
  }

  /**
   * Export ke CSV
   */
  private async exportToCSV(data: any[], filename: string): Promise<string> {
    const filePath = `${this.uploadPath}/${filename}.csv`;
    const { stringify } = require("csv-stringify");

    return new Promise((resolve, reject) => {
      stringify(data, { header: true }, (error, output) => {
        if (error) {
          reject(error);
        } else {
          fs.writeFile(filePath, output)
            .then(() => resolve(filePath))
            .catch(reject);
        }
      });
    });
  }

  /**
   * Export ke Excel
   */
  private async exportToExcel(data: any[], filename: string): Promise<string> {
    const filePath = `${this.uploadPath}/${filename}.xlsx`;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, filePath);
    return filePath;
  }

  /**
   * Export ke JSON
   */
  private async exportToJSON(data: any[], filename: string): Promise<string> {
    const filePath = `${this.uploadPath}/${filename}.json`;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return filePath;
  }

  /**
   * Apply filters ke data
   */
  private applyFilters(data: any[], filters: Record<string, any>): any[] {
    return data.filter((row) => {
      for (const [column, filterValue] of Object.entries(filters)) {
        if (row[column] !== filterValue) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Sort data
   */
  private sortData(
    data: any[],
    sortBy: string,
    sortOrder: "asc" | "desc",
  ): any[] {
    return data.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Mendapatkan ukuran file
   */
  private async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mendapatkan daftar import history untuk user
   */
  async getImportHistory(
    userId: string,
    limit: number = 20,
  ): Promise<DataImport[]> {
    return this.dataImportRepository.find({
      where: { createdById: userId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  /**
   * Mendapatkan daftar export history untuk user
   */
  async getExportHistory(
    userId: string,
    limit: number = 20,
  ): Promise<DataExport[]> {
    return this.dataExportRepository.find({
      where: { createdById: userId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  /**
   * Process import dengan pipeline
   */
  async processImport(
    importId: string,
    pipelineId?: string,
  ): Promise<{ import: DataImport; jobId: string }> {
    const importRecord = await this.dataImportRepository.findOne({
      where: { id: importId },
    });

    if (!importRecord) {
      throw new BadRequestException("Import record not found");
    }

    // Update status ke processing
    importRecord.status = ImportStatus.PROCESSING;
    await this.dataImportRepository.save(importRecord);

    // Tambahkan job ke queue (stubbed for now - assuming queue name is 'import-queue' from constructor)
    const job = await this.importQueue.add("process-import", {
      importId,
      pipelineId,
    });

    return {
      import: importRecord,
      jobId: job.id!,
    };
  }

  /**
   * Get download info
   */
  async getDownloadInfo(filename: string): Promise<any> {
    return {
      filename,
      message: "File streaming implementation required for production",
      url: `/api/data/download/${filename}`,
    };
  }

  /**
   * Delete import
   */
  async deleteImport(id: string): Promise<void> {
    const importRecord = await this.dataImportRepository.findOne({
      where: { id },
    });

    if (!importRecord) {
      throw new BadRequestException("Import record not found");
    }

    // Hapus file
    try {
      await fs.unlink(importRecord.filePath);
    } catch (e) {
      this.logger.warn(`Failed to delete file ${importRecord.filePath}`);
    }

    await this.dataImportRepository.remove(importRecord);
  }

  /**
   * Get details
   */
  async getImportDetails(id: string): Promise<DataImport> {
    const record = await this.dataImportRepository.findOne({ where: { id } });
    if (!record) throw new BadRequestException("Record not found");
    return record;
  }

  async getExportDetails(id: string): Promise<DataExport> {
    const record = await this.dataExportRepository.findOne({ where: { id } });
    if (!record) throw new BadRequestException("Record not found");
    return record;
  }

  /**
   * Get data preview dari record yang sudah ada
   */
  async getDataPreview(
    importId: string,
    options: { limit: number; offset: number },
  ): Promise<{ data: any[]; totalRows: number; columns: string[] }> {
    const importRecord = await this.getImportDetails(importId);

    // Baca file dan parse
    const fileBuffer = await fs.readFile(importRecord.filePath);
    const parsedData = await this.parseFile(
      {
        buffer: fileBuffer,
        originalname: importRecord.filename,
        mimetype: importRecord.mimeType,
        size: importRecord.fileSize,
      } as Express.Multer.File,
      importRecord.metadata,
    );

    return {
      data: parsedData.data.slice(
        options.offset,
        options.offset + options.limit,
      ),
      totalRows: parsedData.rowCount,
      columns: parsedData.columns,
    };
  }

  /**
   * Hapus file import lama (cleanup)
   */
  async cleanupOldImports(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // TODO: Implement cleanup of old imports
    const oldImports = []; // await this.dataImportRepository.find({
    //   where: {
    //     createdAt: { $lt: cutoffDate } as any,
    //     status: ImportStatus.COMPLETED as any,
    //   },
    // });

    for (const importRecord of oldImports) {
      try {
        await fs.unlink(importRecord.filePath);
      } catch (error) {
        this.logger.warn(
          `Failed to delete file ${importRecord.filePath}:`,
          error,
        );
      }
    }

    const result = await this.dataImportRepository.delete({
      createdAt: { $lt: cutoffDate } as any,
      status: ImportStatus.COMPLETED,
    });

    return result.affected || 0;
  }
}
