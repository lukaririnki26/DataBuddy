/**
 * Data Controller
 *
 * Controller untuk API data operations di DataBuddy yang menangani:
 * - Upload file data (CSV, Excel)
 * - Preview dan validasi data
 * - Export data dalam berbagai format
 * - History import/export
 */

import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DataService, FileUploadResult, DataValidationResult, ExportOptions } from './data.service';

@ApiTags('Data Operations')
@ApiBearerAuth()
@Controller('data')
@UseGuards(JwtAuthGuard)
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload data file',
    description: 'Upload file data (CSV atau Excel) untuk diproses. Mendukung preview otomatis dan validasi.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        fileId: { type: 'string' },
        filename: { type: 'string' },
        size: { type: 'number' },
        mimeType: { type: 'string' },
        rowCount: { type: 'number' },
        columnCount: { type: 'number' },
        columns: { type: 'array', items: { type: 'string' } },
        preview: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or upload failed',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body() body: {
      hasHeader?: string;
      encoding?: string;
      separator?: string;
    },
  ): Promise<FileUploadResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validasi tipe file
    const allowedMimeTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      throw new BadRequestException(
        'Invalid file type. Please upload CSV or Excel files only.'
      );
    }

    // Validasi ukuran file (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 50MB.');
    }

    const options = {
      hasHeader: body.hasHeader === 'true' || body.hasHeader === undefined,
      encoding: body.encoding || 'utf8',
      separator: body.separator || ',',
    };

    return this.dataService.uploadFile(file, req.user.id, options);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate uploaded data',
    description: 'Validasi data yang sudah diupload berdasarkan rules tertentu seperti required columns, data types, dan custom validation rules.'
  })
  @ApiResponse({
    status: 200,
    description: 'Data validation completed',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number' },
              column: { type: 'string' },
              value: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
        warnings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number' },
              column: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async validateData(
    @Body() body: {
      fileId: string;
      validationRules: {
        requiredColumns?: string[];
        dataTypes?: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
        customRules?: Array<{
          column: string;
          rule: string;
          message: string;
        }>;
      };
    },
  ): Promise<DataValidationResult> {
    const { fileId, validationRules } = body;

    if (!fileId) {
      throw new BadRequestException('fileId is required');
    }

    return this.dataService.validateData(fileId, validationRules);
  }

  @Post('export')
  @ApiOperation({
    summary: 'Export data',
    description: 'Export data dalam format CSV, Excel, atau JSON dengan opsi filter, sorting, dan column selection.'
  })
  @ApiResponse({
    status: 200,
    description: 'Data exported successfully',
    schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' },
        filename: { type: 'string' },
        downloadUrl: { type: 'string' },
      },
    },
  })
  async exportData(
    @Body() body: {
      data: any[];
      options: ExportOptions;
      filename?: string;
    },
    @Request() req,
  ) {
    const { data, options, filename } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new BadRequestException('Valid data array is required');
    }

    if (!options || !options.format) {
      throw new BadRequestException('Export options with format are required');
    }

    const filePath = await this.dataService.exportData(data, options, req.user.id, filename);

    // Generate download URL (dalam implementasi nyata, ini akan menggunakan CDN atau file server)
    const downloadUrl = `/api/data/download/${filePath.split('/').pop()}`;

    return {
      filePath,
      filename: filePath.split('/').pop(),
      downloadUrl,
      format: options.format,
      rowCount: data.length,
    };
  }

  @Get('imports')
  @ApiOperation({
    summary: 'Get import history',
    description: 'Mengambil riwayat file import untuk user yang sedang login.'
  })
  @ApiResponse({
    status: 200,
    description: 'Import history retrieved successfully',
  })
  async getImportHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.dataService.getImportHistory(req.user.id, limitNum);
  }

  @Get('exports')
  @ApiOperation({
    summary: 'Get export history',
    description: 'Mengambil riwayat file export untuk user yang sedang login.'
  })
  @ApiResponse({
    status: 200,
    description: 'Export history retrieved successfully',
  })
  async getExportHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.dataService.getExportHistory(req.user.id, limitNum);
  }

  @Get('download/:filename')
  @ApiOperation({
    summary: 'Download exported file',
    description: 'Download file yang sudah diexport berdasarkan filename.'
  })
  @ApiResponse({
    status: 200,
    description: 'File download initiated',
  })
  async downloadFile(@Param('filename') filename: string) {
    // Dalam implementasi nyata, ini akan menggunakan express response untuk stream file
    // Untuk sementara return info file
    return {
      filename,
      message: 'File download endpoint - implementasi penuh memerlukan file streaming',
    };
  }

  @Get('templates')
  @ApiOperation({
    summary: 'Get data templates',
    description: 'Mengambil template data untuk berbagai jenis import (karyawan, produk, dll).'
  })
  @ApiResponse({
    status: 200,
    description: 'Data templates retrieved successfully',
  })
  async getDataTemplates() {
    // Template untuk berbagai jenis data yang sering diimport
    const templates = [
      {
        name: 'Employee Data',
        description: 'Template untuk import data karyawan',
        columns: [
          'employee_id',
          'name',
          'email',
          'department',
          'position',
          'hire_date',
          'salary',
        ],
        dataTypes: {
          employee_id: 'string',
          name: 'string',
          email: 'string',
          department: 'string',
          position: 'string',
          hire_date: 'date',
          salary: 'number',
        },
        requiredColumns: ['employee_id', 'name', 'email'],
      },
      {
        name: 'Product Catalog',
        description: 'Template untuk import katalog produk',
        columns: [
          'product_id',
          'name',
          'description',
          'category',
          'price',
          'stock_quantity',
          'supplier',
        ],
        dataTypes: {
          product_id: 'string',
          name: 'string',
          description: 'string',
          category: 'string',
          price: 'number',
          stock_quantity: 'number',
          supplier: 'string',
        },
        requiredColumns: ['product_id', 'name', 'price'],
      },
      {
        name: 'Customer Data',
        description: 'Template untuk import data pelanggan',
        columns: [
          'customer_id',
          'name',
          'email',
          'phone',
          'address',
          'city',
          'country',
          'registration_date',
        ],
        dataTypes: {
          customer_id: 'string',
          name: 'string',
          email: 'string',
          phone: 'string',
          address: 'string',
          city: 'string',
          country: 'string',
          registration_date: 'date',
        },
        requiredColumns: ['customer_id', 'name', 'email'],
      },
    ];

    return { templates };
  }

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Preview file data',
    description: 'Preview isi file tanpa menyimpannya ke database untuk validasi awal.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'File preview generated successfully',
  })
  async previewFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      hasHeader?: string;
      maxRows?: string;
    },
  ): Promise<{
    columns: string[];
    preview: any[];
    rowCount: number;
    columnCount: number;
  }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const options = {
      hasHeader: body.hasHeader === 'true',
    };

    const maxRows = body.maxRows ? parseInt(body.maxRows, 10) : 10;

    // Parse file untuk preview
    const dataService = this.dataService as any;
    const parsedData = await dataService.parseFile(file, options);

    return {
      columns: parsedData.columns,
      preview: parsedData.preview.slice(0, maxRows),
      rowCount: parsedData.rowCount,
      columnCount: parsedData.columnCount,
    };
  }
}
