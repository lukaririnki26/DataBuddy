#!/usr/bin/env ts-node-esm

/**
 * Database Seeder Runner (SQL Version)
 *
 * This script runs the database seeders using direct SQL queries
 */

import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as bcrypt from 'bcrypt';
import * as pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env') });

async function runSeeder() {
  console.log('🌱 Starting DataBuddy Database Seeder (SQL)...');

  // Create database connection
  const client = new pg.Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'databuddy',
  });

  try {
    await client.connect();
    console.log('✅ Database connection established');

    // Hash passwords
    const saltRounds = 12;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const editorPassword = await bcrypt.hash('editor123', saltRounds);
    const viewerPassword = await bcrypt.hash('viewer123', saltRounds);

    // Insert users
    await client.query(`
      INSERT INTO "users" (
        "id", "email", "firstName", "lastName", "password", "role", "status",
        "preferences", "createdAt", "updatedAt"
      ) VALUES
      ('00000000-0000-0000-0000-000000000001', 'admin@databuddy.com', 'Admin', 'DataBuddy', $1, 'admin', 'active', '{"theme": "light", "language": "en", "timezone": "UTC"}', NOW(), NOW()),
      ('00000000-0000-0000-0000-000000000002', 'editor@databuddy.com', 'Jane', 'Editor', $2, 'editor', 'active', '{"theme": "dark", "language": "en", "timezone": "UTC"}', NOW(), NOW()),
      ('00000000-0000-0000-0000-000000000003', 'viewer@databuddy.com', 'John', 'Viewer', $3, 'viewer', 'active', '{"theme": "light", "language": "en", "timezone": "UTC"}', NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING
    `, [adminPassword, editorPassword, viewerPassword]);
    console.log('✅ Users created');

    // Insert pipelines
    await client.query(`
      INSERT INTO "pipelines" (
        "id", "name", "description", "type", "status", "config", "inputSchema",
        "outputSchema", "version", "isTemplate", "category", "tags",
        "createdAt", "updatedAt", "createdById"
      ) VALUES
      ('10000000-0000-0000-0000-000000000001', 'CSV Data Import Template', 'Template untuk mengimport data CSV dengan validasi dasar', 'import', 'active', '{"autoValidate": true, "skipErrors": false}', '{"type": "object", "properties": {"file": {"type": "string", "format": "binary"}}}', '{"type": "array", "items": {"type": "object"}}', 1, true, 'Import', '["csv", "import", "template", "data-processing"]', NOW(), NOW(), '00000000-0000-0000-0000-000000000001'),
      ('10000000-0000-0000-0000-000000000002', 'Data Cleaning Pipeline', 'Pipeline untuk membersihkan dan menstandardisasi data', 'transform', 'active', '{"strictMode": false}', '{"type": "array", "items": {"type": "object"}}', '{"type": "array", "items": {"type": "object"}}', 1, true, 'Data Quality', '["cleaning", "transform", "data-quality", "standardization"]', NOW(), NOW(), '00000000-0000-0000-0000-000000000001'),
      ('10000000-0000-0000-0000-000000000003', 'Excel Export Pipeline', 'Pipeline untuk mengekspor data ke format Excel', 'export', 'active', '{"includeHeaders": true, "autoFormat": true}', '{"type": "array", "items": {"type": "object"}}', '{"type": "string", "format": "binary"}', 1, true, 'Export', '["excel", "export", "xlsx", "data-export"]', NOW(), NOW(), '00000000-0000-0000-0000-000000000001')
      ON CONFLICT ("id") DO NOTHING
    `);
    console.log('✅ Pipeline templates created');

    // Insert pipeline steps
    await client.query(`
      INSERT INTO "pipeline_steps" (
        "id", "name", "description", "type", "status", "order", "config",
        "continueOnError", "retryCount", "timeoutSeconds",
        "createdAt", "updatedAt", "pipelineId"
      ) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11),
      ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW(), $22),
      ($23, $24, $25, $26, $27, $28, $29, $30, $31, $32, NOW(), NOW(), $33),
      ($34, $35, $36, $37, $38, $39, $40, $41, $42, $43, NOW(), NOW(), $44),
      ($45, $46, $47, $48, $49, $50, $51, $52, $53, $54, NOW(), NOW(), $55),
      ($56, $57, $58, $59, $60, $61, $62, $63, $64, $65, NOW(), NOW(), $66)
      ON CONFLICT ("id") DO NOTHING
    `, [
      '20000000-0000-0000-0000-000000000001', 'Read CSV File', 'Membaca file CSV dari input', 'read_file', 'active', 1, '{"fileFormat": "csv", "hasHeader": true, "encoding": "utf8", "delimiter": ","}', false, 3, 300, '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002', 'Validate Data', 'Memvalidasi struktur dan tipe data', 'validate_schema', 'active', 2, '{"rules": [{"type": "required", "column": "name", "message": "Name is required"}, {"type": "email", "column": "email"}]}', false, 0, 60, '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000003', 'Check Duplicates', 'Memeriksa dan menghapus data duplikat', 'check_duplicates', 'active', 1, '{"columns": ["name", "email"], "method": "remove"}', true, 0, 120, '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000004', 'Custom Processing', 'Proses kustom untuk membersihkan data', 'custom_script', 'active', 2, '{"script": "return data.map(row => ({ ...row, status: row.status || \\\"active\\\" }))"}', true, 0, 60, '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000005', 'Format Data for Export', 'Memformat data sebelum diekspor', 'transform_columns', 'active', 1, '{"mappings": {"created_at": "createdAt", "updated_at": "updatedAt"}, "dateFormat": "YYYY-MM-DD"}', false, 0, 60, '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000006', 'Export to Excel', 'Mengekspor data ke file Excel', 'write_file', 'active', 2, '{"format": "xlsx", "sheetName": "Data", "includeHeaders": true}', false, 2, 300, '10000000-0000-0000-0000-000000000003'
    ]);
    console.log('✅ Pipeline steps created');

    // Insert sample data imports
    await client.query(`
      INSERT INTO "data_imports" (
        "id", "name", "description", "status", "sourceType", "fileFormat",
        "originalFileName", "totalRows", "processedRows", "createdAt", "updatedAt", "createdById"
      ) VALUES
      ('30000000-0000-0000-0000-000000000001', 'Sample Customer Data', 'Contoh data pelanggan untuk testing', 'completed', 'file_upload', 'csv', 'customers.csv', 1000, 1000, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', '00000000-0000-0000-0000-000000000001'),
      ('30000000-0000-0000-0000-000000000002', 'Product Inventory', 'Data inventori produk', 'completed', 'file_upload', 'xlsx', 'inventory.xlsx', 500, 500, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000002')
      ON CONFLICT ("id") DO NOTHING
    `);
    console.log('✅ Sample data imports created');

    // Insert sample data exports
    await client.query(`
      INSERT INTO "data_exports" (
        "id", "name", "description", "status", "destinationType", "fileFormat",
        "outputFileName", "totalRows", "processedRows", "createdAt", "updatedAt", "createdById"
      ) VALUES
      ('40000000-0000-0000-0000-000000000001', 'Customer Report', 'Laporan data pelanggan untuk manajemen', 'completed', 'file_download', 'xlsx', 'customer_report.xlsx', 1000, 1000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000001')
      ON CONFLICT ("id") DO NOTHING
    `);
    console.log('✅ Sample data exports created');

    // Insert notifications
    await client.query(`
      INSERT INTO "notifications" (
        "id", "title", "message", "type", "priority", "status", "metadata",
        "createdAt", "updatedAt", "userId"
      ) VALUES
      ('50000000-0000-0000-0000-000000000001', 'Welcome to DataBuddy!', 'Selamat datang di DataBuddy! Platform ini siap membantu Anda mengelola dan memproses data dengan mudah.', 'system_maintenance', 'low', 'unread', '{"welcome": true, "version": "1.0.0"}', NOW(), NOW(), '00000000-0000-0000-0000-000000000001'),
      ('50000000-0000-0000-0000-000000000002', 'Pipeline Templates Available', 'Beberapa template pipeline telah tersedia untuk membantu Anda memulai. Cek di menu Pipelines.', 'system_maintenance', 'low', 'unread', '{"templates": ["CSV Import", "Data Cleaning", "Excel Export"]}', NOW(), NOW(), '00000000-0000-0000-0000-000000000001'),
      ('50000000-0000-0000-0000-000000000003', 'Welcome to DataBuddy!', 'Akun editor Anda telah dibuat. Anda dapat membuat dan mengelola pipeline serta mengimport data.', 'system_maintenance', 'low', 'unread', '{"welcome": true, "role": "editor"}', NOW(), NOW(), '00000000-0000-0000-0000-000000000002'),
      ('50000000-0000-0000-0000-000000000004', 'Welcome to DataBuddy!', 'Akun viewer Anda telah dibuat. Anda dapat melihat pipeline dan data yang tersedia.', 'system_maintenance', 'low', 'unread', '{"welcome": true, "role": "viewer"}', NOW(), NOW(), '00000000-0000-0000-0000-000000000003')
      ON CONFLICT ("id") DO NOTHING
    `);
    console.log('✅ Welcome notifications created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('=====================================');
    console.log('Created:');
    console.log('  • 3 Users (Admin, Editor, Viewer)');
    console.log('  • 3 Pipeline Templates');
    console.log('  • 6 Pipeline Steps');
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
    await client.end();
  }
}

// Run the seeder
runSeeder().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
