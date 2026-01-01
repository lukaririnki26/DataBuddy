#!/usr/bin/env ts-node-esm

/**
 * Database Seeder Runner
 *
 * This script runs the database seeders to populate initial data
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env') });

// Import entities (after reflect-metadata is loaded)
import { User } from '../src/entities/user.entity';
import { Pipeline } from '../src/entities/pipeline.entity';
import { PipelineStep } from '../src/entities/pipeline-step.entity';
import { DataImport } from '../src/entities/data-import.entity';
import { DataExport } from '../src/entities/data-export.entity';
import { Notification } from '../src/entities/notification.entity';

async function runSeeder() {
  console.log('🌱 Starting DataBuddy Database Seeder...');

  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'databuddy',
    entities: [User, Pipeline, PipelineStep, DataImport, DataExport, Notification],
    synchronize: false, // Don't sync, use migrations
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Hash passwords
    const saltRounds = 12;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const editorPassword = await bcrypt.hash('editor123', saltRounds);
    const viewerPassword = await bcrypt.hash('viewer123', saltRounds);

    // Create admin user
    const adminUser = dataSource.manager.create(User, {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@databuddy.com',
      firstName: 'Admin',
      lastName: 'DataBuddy',
      password: adminPassword,
      role: 'admin' as any,
      status: 'active' as any,
      preferences: { theme: 'light', language: 'en', timezone: 'UTC' },
    });
    await dataSource.manager.save(adminUser);
    console.log('✅ Admin user created');

    // Create editor user
    const editorUser = dataSource.manager.create(User, {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'editor@databuddy.com',
      firstName: 'Jane',
      lastName: 'Editor',
      password: editorPassword,
      role: 'editor' as any,
      status: 'active' as any,
      preferences: { theme: 'dark', language: 'en', timezone: 'UTC' },
    });
    await dataSource.manager.save(editorUser);
    console.log('✅ Editor user created');

    // Create viewer user
    const viewerUser = dataSource.manager.create(User, {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'viewer@databuddy.com',
      firstName: 'John',
      lastName: 'Viewer',
      password: viewerPassword,
      role: 'viewer' as any,
      status: 'active' as any,
      preferences: { theme: 'light', language: 'en', timezone: 'UTC' },
    });
    await dataSource.manager.save(viewerUser);
    console.log('✅ Viewer user created');

    // Create pipeline templates
    const csvImportPipeline = dataSource.manager.create(Pipeline, {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'CSV Data Import Template',
      description: 'Template untuk mengimport data CSV dengan validasi dasar',
      type: 'import' as any,
      status: 'active' as any,
      config: { autoValidate: true, skipErrors: false },
      inputSchema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
      outputSchema: { type: 'array', items: { type: 'object' } },
      version: 1,
      isTemplate: true,
      category: 'Import',
      tags: ['csv', 'import', 'template', 'data-processing'],
      createdById: adminUser.id,
    });
    await dataSource.manager.save(csvImportPipeline);

    const dataCleaningPipeline = dataSource.manager.create(Pipeline, {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Data Cleaning Pipeline',
      description: 'Pipeline untuk membersihkan dan menstandardisasi data',
      type: 'transform' as any,
      status: 'active' as any,
      config: { strictMode: false },
      inputSchema: { type: 'array', items: { type: 'object' } },
      outputSchema: { type: 'array', items: { type: 'object' } },
      version: 1,
      isTemplate: true,
      category: 'Data Quality',
      tags: ['cleaning', 'transform', 'data-quality', 'standardization'],
      createdById: adminUser.id,
    });
    await dataSource.manager.save(dataCleaningPipeline);

    const excelExportPipeline = dataSource.manager.create(Pipeline, {
      id: '10000000-0000-0000-0000-000000000003',
      name: 'Excel Export Pipeline',
      description: 'Pipeline untuk mengekspor data ke format Excel',
      type: 'export' as any,
      status: 'active' as any,
      config: { includeHeaders: true, autoFormat: true },
      inputSchema: { type: 'array', items: { type: 'object' } },
      outputSchema: { type: 'string', format: 'binary' },
      version: 1,
      isTemplate: true,
      category: 'Export',
      tags: ['excel', 'export', 'xlsx', 'data-export'],
      createdById: adminUser.id,
    });
    await dataSource.manager.save(excelExportPipeline);
    console.log('✅ Pipeline templates created');

    // Create pipeline steps
    const csvReadStep = dataSource.manager.create(PipelineStep, {
      id: '20000000-0000-0000-0000-000000000001',
      name: 'Read CSV File',
      description: 'Membaca file CSV dari input',
      type: 'read_file' as any,
      status: 'active' as any,
      order: 1,
      config: { fileFormat: 'csv', hasHeader: true, encoding: 'utf8', delimiter: ',' },
      continueOnError: false,
      retryCount: 3,
      timeoutSeconds: 300,
      pipelineId: csvImportPipeline.id,
    });
    await dataSource.manager.save(csvReadStep);

    const validateStep = dataSource.manager.create(PipelineStep, {
      id: '20000000-0000-0000-0000-000000000002',
      name: 'Validate Data',
      description: 'Memvalidasi struktur dan tipe data',
      type: 'validate_data' as any,
      status: 'active' as any,
      order: 2,
      config: {
        rules: [
          { type: 'required', column: 'name', message: 'Name is required' },
          { type: 'email', column: 'email' }
        ]
      },
      continueOnError: false,
      retryCount: 0,
      timeoutSeconds: 60,
      pipelineId: csvImportPipeline.id,
    });
    await dataSource.manager.save(validateStep);

    // Data cleaning steps
    const cleanStep = dataSource.manager.create(PipelineStep, {
      id: '20000000-0000-0000-0000-000000000003',
      name: 'Clean Text Data',
      description: 'Membersihkan dan menstandardisasi data teks',
      type: 'clean_data' as any,
      status: 'active' as any,
      order: 1,
      config: {
        columns: ['name', 'description'],
        trim: true,
        lowercase: false,
        removeExtraSpaces: true
      },
      continueOnError: true,
      retryCount: 0,
      timeoutSeconds: 120,
      pipelineId: dataCleaningPipeline.id,
    });
    await dataSource.manager.save(cleanStep);

    // Excel export steps
    const formatStep = dataSource.manager.create(PipelineStep, {
      id: '20000000-0000-0000-0000-000000000005',
      name: 'Format Data for Export',
      description: 'Memformat data sebelum diekspor',
      type: 'transform_columns' as any,
      status: 'active' as any,
      order: 1,
      config: {
        mappings: { created_at: 'createdAt', updated_at: 'updatedAt' },
        dateFormat: 'YYYY-MM-DD'
      },
      continueOnError: false,
      retryCount: 0,
      timeoutSeconds: 60,
      pipelineId: excelExportPipeline.id,
    });
    await dataSource.manager.save(formatStep);

    console.log('✅ Pipeline steps created');

    // Create sample data imports
    const sampleImport1 = dataSource.manager.create(DataImport, {
      id: '30000000-0000-0000-0000-000000000001',
      name: 'Sample Customer Data',
      description: 'Contoh data pelanggan untuk testing',
      status: 'completed' as any,
      sourceType: 'file_upload' as any,
      fileFormat: 'csv' as any,
      originalFileName: 'customers.csv',
      totalRows: 1000,
      processedRows: 1000,
      createdById: adminUser.id,
    });
    await dataSource.manager.save(sampleImport1);

    const sampleImport2 = dataSource.manager.create(DataImport, {
      id: '30000000-0000-0000-0000-000000000002',
      name: 'Product Inventory',
      description: 'Data inventori produk',
      status: 'completed' as any,
      sourceType: 'file_upload' as any,
      fileFormat: 'xlsx' as any,
      originalFileName: 'inventory.xlsx',
      totalRows: 500,
      processedRows: 500,
      createdById: editorUser.id,
    });
    await dataSource.manager.save(sampleImport2);
    console.log('✅ Sample data imports created');

    // Create sample data exports
    const sampleExport = dataSource.manager.create(DataExport, {
      id: '40000000-0000-0000-0000-000000000001',
      name: 'Customer Report',
      description: 'Laporan data pelanggan untuk manajemen',
      status: 'completed' as any,
      destinationType: 'file_download' as any,
      fileFormat: 'xlsx' as any,
      outputFileName: 'customer_report.xlsx',
      totalRows: 1000,
      processedRows: 1000,
      createdById: adminUser.id,
    });
    await dataSource.manager.save(sampleExport);
    console.log('✅ Sample data exports created');

    // Create welcome notifications
    const adminWelcome = dataSource.manager.create(Notification, {
      id: '50000000-0000-0000-0000-000000000001',
      title: 'Welcome to DataBuddy!',
      message: 'Selamat datang di DataBuddy! Platform ini siap membantu Anda mengelola dan memproses data dengan mudah.',
      type: 'system_maintenance' as any,
      priority: 'low' as any,
      status: 'unread' as any,
      metadata: { welcome: true, version: '1.0.0' },
      userId: adminUser.id,
    });
    await dataSource.manager.save(adminWelcome);

    const adminTemplates = dataSource.manager.create(Notification, {
      id: '50000000-0000-0000-0000-000000000002',
      title: 'Pipeline Templates Available',
      message: 'Beberapa template pipeline telah tersedia untuk membantu Anda memulai. Cek di menu Pipelines.',
      type: 'system_maintenance' as any,
      priority: 'low' as any,
      status: 'unread' as any,
      metadata: { templates: ['CSV Import', 'Data Cleaning', 'Excel Export'] },
      userId: adminUser.id,
    });
    await dataSource.manager.save(adminTemplates);

    const editorWelcome = dataSource.manager.create(Notification, {
      id: '50000000-0000-0000-0000-000000000003',
      title: 'Welcome to DataBuddy!',
      message: 'Akun editor Anda telah dibuat. Anda dapat membuat dan mengelola pipeline serta mengimport data.',
      type: 'system_maintenance' as any,
      priority: 'low' as any,
      status: 'unread' as any,
      metadata: { welcome: true, role: 'editor' },
      userId: editorUser.id,
    });
    await dataSource.manager.save(editorWelcome);

    const viewerWelcome = dataSource.manager.create(Notification, {
      id: '50000000-0000-0000-0000-000000000004',
      title: 'Welcome to DataBuddy!',
      message: 'Akun viewer Anda telah dibuat. Anda dapat melihat pipeline dan data yang tersedia.',
      type: 'system_maintenance' as any,
      priority: 'low' as any,
      status: 'unread' as any,
      metadata: { welcome: true, role: 'viewer' },
      userId: viewerUser.id,
    });
    await dataSource.manager.save(viewerWelcome);
    console.log('✅ Welcome notifications created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('=====================================');
    console.log('Created:');
    console.log('  • 3 Users (Admin, Editor, Viewer)');
    console.log('  • 3 Pipeline Templates');
    console.log('  • 5 Pipeline Steps');
    console.log('  • 2 Sample Data Imports');
    console.log('  • 1 Sample Data Export');
    console.log('  • 4 Welcome Notifications');
    console.log('');
    console.log('Login credentials:');
    console.log('  Admin: admin@databuddy.com / admin123');
    console.log('  Editor: editor@databuddy.com / editor123');
    console.log('  Viewer: viewer@databuddy.com / viewer123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the seeder
runSeeder().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
