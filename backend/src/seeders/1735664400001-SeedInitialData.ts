import 'reflect-metadata';
import { MigrationInterface, QueryRunner } from "typeorm";
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

// Load environment variables
config({ path: '../../.env' });

async function runSeeder() {
  console.log('🌱 Starting DataBuddy Database Seeder...');

  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'databuddy',
    synchronize: false, // Don't sync, use migrations
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    await seedData(dataSource);

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

async function seedData(dataSource: DataSource) {
    // Create query runner
    const queryRunner = dataSource.createQueryRunner();

    try {
        // Start transaction
        await queryRunner.startTransaction();

        // Import entities
        const { User } = await import('../entities/user.entity');
        const { Pipeline } = await import('../entities/pipeline.entity');
        const { PipelineStep } = await import('../entities/pipeline-step.entity');
        const { DataImport } = await import('../entities/data-import.entity');
        const { DataExport } = await import('../entities/data-export.entity');
        const { Notification } = await import('../entities/notification.entity');

    // Hash passwords manually
    const saltRounds = 12;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const editorPassword = await bcrypt.hash('editor123', saltRounds);
    const viewerPassword = await bcrypt.hash('viewer123', saltRounds);

    // Insert users directly using queryRunner to avoid entity hooks
    await queryRunner.query(`
        INSERT INTO "users" (
            "id", "email", "firstName", "lastName", "password", "role", "status",
            "preferences", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [
        '00000000-0000-0000-0000-000000000001',
        'admin@databuddy.com',
        'Admin',
        'DataBuddy',
        adminPassword,
        'admin',
        'active',
        JSON.stringify({ theme: 'light', language: 'en', timezone: 'UTC' })
    ]);
    console.log('✅ Admin user created');

    await queryRunner.query(`
        INSERT INTO "users" (
            "id", "email", "firstName", "lastName", "password", "role", "status",
            "preferences", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [
        '00000000-0000-0000-0000-000000000002',
        'editor@databuddy.com',
        'Jane',
        'Editor',
        editorPassword,
        'editor',
        'active',
        JSON.stringify({ theme: 'dark', language: 'en', timezone: 'UTC' })
    ]);
    console.log('✅ Editor user created');

    await queryRunner.query(`
        INSERT INTO "users" (
            "id", "email", "firstName", "lastName", "password", "role", "status",
            "preferences", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [
        '00000000-0000-0000-0000-000000000003',
        'viewer@databuddy.com',
        'John',
        'Viewer',
        viewerPassword,
        'viewer',
        'active',
        JSON.stringify({ theme: 'light', language: 'en', timezone: 'UTC' })
    ]);
    console.log('✅ Viewer user created');

        // Insert sample pipeline templates
        await queryRunner.query(`
            INSERT INTO "pipelines" (
                "id", "name", "description", "type", "status", "config", "inputSchema",
                "outputSchema", "version", "isTemplate", "category", "tags",
                "createdAt", "updatedAt", "createdById"
            ) VALUES (
                '10000000-0000-0000-0000-000000000001',
                'CSV Data Import Template',
                'Template untuk mengimport data CSV dengan validasi dasar',
                'import',
                'active',
                '{"autoValidate": true, "skipErrors": false}',
                '{"type": "object", "properties": {"file": {"type": "string", "format": "binary"}}}',
                '{"type": "array", "items": {"type": "object"}}',
                1,
                true,
                'Import',
                '["csv", "import", "template", "data-processing"]',
                NOW(),
                NOW(),
                '00000000-0000-0000-0000-000000000001'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "pipelines" (
                "id", "name", "description", "type", "status", "config", "inputSchema",
                "outputSchema", "version", "isTemplate", "category", "tags",
                "createdAt", "updatedAt", "createdById"
            ) VALUES (
                '10000000-0000-0000-0000-000000000002',
                'Data Cleaning Pipeline',
                'Pipeline untuk membersihkan dan menstandardisasi data',
                'transform',
                'active',
                '{"strictMode": false}',
                '{"type": "array", "items": {"type": "object"}}',
                '{"type": "array", "items": {"type": "object"}}',
                1,
                true,
                'Data Quality',
                '["cleaning", "transform", "data-quality", "standardization"]',
                NOW(),
                NOW(),
                '00000000-0000-0000-0000-000000000001'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "pipelines" (
                "id", "name", "description", "type", "status", "config", "inputSchema",
                "outputSchema", "version", "isTemplate", "category", "tags",
                "createdAt", "updatedAt", "createdById"
            ) VALUES (
                '10000000-0000-0000-0000-000000000003',
                'Excel Export Pipeline',
                'Pipeline untuk mengekspor data ke format Excel',
                'export',
                'active',
                '{"includeHeaders": true, "autoFormat": true}',
                '{"type": "array", "items": {"type": "object"}}',
                '{"type": "string", "format": "binary"}',
                1,
                true,
                'Export',
                '["excel", "export", "xlsx", "data-export"]',
                NOW(),
                NOW(),
                '00000000-0000-0000-0000-000000000001'
            )
        `);

        // Insert pipeline steps for CSV Import Template
        await queryRunner.query(`
            INSERT INTO "pipeline_steps" (
                "id", "name", "description", "type", "status", "order", "config",
                "continueOnError", "retryCount", "timeoutSeconds",
                "createdAt", "updatedAt", "pipelineId"
            ) VALUES (
                '20000000-0000-0000-0000-000000000001',
                'Read CSV File',
                'Membaca file CSV dari input',
                'read_file',
                'active',
                1,
                '{"fileFormat": "csv", "hasHeader": true, "encoding": "utf8", "delimiter": ","}',
                false,
                3,
                300,
                NOW(),
                NOW(),
                '10000000-0000-0000-0000-000000000001'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "pipeline_steps" (
                "id", "name", "description", "type", "status", "order", "config",
                "continueOnError", "retryCount", "timeoutSeconds",
                "createdAt", "updatedAt", "pipelineId"
            ) VALUES (
                '20000000-0000-0000-0000-000000000002',
                'Validate Data',
                'Memvalidasi struktur dan tipe data',
                'validate_data',
                'active',
                2,
                '{"rules": [{"type": "required", "column": "name", "message": "Name is required"}, {"type": "email", "column": "email"}]}',
                false,
                0,
                60,
                NOW(),
                NOW(),
                '10000000-0000-0000-0000-000000000001'
            )
        `);

        // Insert pipeline steps for Data Cleaning Pipeline
        await queryRunner.query(`
            INSERT INTO "pipeline_steps" (
                "id", "name", "description", "type", "status", "order", "config",
                "continueOnError", "retryCount", "timeoutSeconds",
                "createdAt", "updatedAt", "pipelineId"
            ) VALUES (
                '20000000-0000-0000-0000-000000000003',
                'Clean Text Data',
                'Membersihkan dan menstandardisasi data teks',
                'clean_data',
                'active',
                1,
                '{"columns": ["name", "description"], "trim": true, "lowercase": false, "removeExtraSpaces": true}',
                true,
                0,
                120,
                NOW(),
                NOW(),
                '10000000-0000-0000-0000-000000000002'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "pipeline_steps" (
                "id", "name", "description", "type", "status", "order", "config",
                "continueOnError", "retryCount", "timeoutSeconds",
                "createdAt", "updatedAt", "pipelineId"
            ) VALUES (
                '20000000-0000-0000-0000-000000000004',
                'Fill Missing Values',
                'Mengisi nilai yang hilang dengan default values',
                'fill_missing_values',
                'active',
                2,
                '{"rules": [{"column": "status", "defaultValue": "active"}, {"column": "createdAt", "defaultValue": "now"}]}',
                true,
                0,
                60,
                NOW(),
                NOW(),
                '10000000-0000-0000-0000-000000000002'
            )
        `);

        // Insert pipeline steps for Excel Export Pipeline
        await queryRunner.query(`
            INSERT INTO "pipeline_steps" (
                "id", "name", "description", "type", "status", "order", "config",
                "continueOnError", "retryCount", "timeoutSeconds",
                "createdAt", "updatedAt", "pipelineId"
            ) VALUES (
                '20000000-0000-0000-0000-000000000005',
                'Format Data for Export',
                'Memformat data sebelum diekspor',
                'transform_columns',
                'active',
                1,
                '{"mappings": {"created_at": "createdAt", "updated_at": "updatedAt"}, "dateFormat": "YYYY-MM-DD"}',
                false,
                0,
                60,
                NOW(),
                NOW(),
                '10000000-0000-0000-0000-000000000003'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "pipeline_steps" (
                "id", "name", "description", "type", "status", "order", "config",
                "continueOnError", "retryCount", "timeoutSeconds",
                "createdAt", "updatedAt", "pipelineId"
            ) VALUES (
                '20000000-0000-0000-0000-000000000006',
                'Export to Excel',
                'Mengekspor data ke file Excel',
                'write_file',
                'active',
                2,
                '{"format": "xlsx", "sheetName": "Data", "includeHeaders": true}',
                false,
                2,
                300,
                NOW(),
                NOW(),
                '10000000-0000-0000-0000-000000000003'
            )
        `);

        // Insert sample data imports
        await queryRunner.query(`
            INSERT INTO "data_imports" (
                "id", "name", "description", "status", "sourceType", "fileFormat",
                "originalFileName", "totalRows", "processedRows", "createdAt", "updatedAt", "createdById"
            ) VALUES (
                '30000000-0000-0000-0000-000000000001',
                'Sample Customer Data',
                'Contoh data pelanggan untuk testing',
                'completed',
                'file_upload',
                'csv',
                'customers.csv',
                1000,
                1000,
                NOW() - INTERVAL '2 days',
                NOW() - INTERVAL '2 days',
                '00000000-0000-0000-0000-000000000001'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "data_imports" (
                "id", "name", "description", "status", "sourceType", "fileFormat",
                "originalFileName", "totalRows", "processedRows", "createdAt", "updatedAt", "createdById"
            ) VALUES (
                '30000000-0000-0000-0000-000000000002',
                'Product Inventory',
                'Data inventori produk',
                'completed',
                'file_upload',
                'xlsx',
                'inventory.xlsx',
                500,
                500,
                NOW() - INTERVAL '1 day',
                NOW() - INTERVAL '1 day',
                '00000000-0000-0000-0000-000000000002'
            )
        `);

        // Insert sample data exports
        await queryRunner.query(`
            INSERT INTO "data_exports" (
                "id", "name", "description", "status", "destinationType", "fileFormat",
                "outputFileName", "totalRows", "processedRows", "createdAt", "updatedAt", "createdById"
            ) VALUES (
                '40000000-0000-0000-0000-000000000001',
                'Customer Report',
                'Laporan data pelanggan untuk manajemen',
                'completed',
                'file_download',
                'xlsx',
                'customer_report.xlsx',
                1000,
                1000,
                NOW() - INTERVAL '1 day',
                NOW() - INTERVAL '1 day',
                '00000000-0000-0000-0000-000000000001'
            )
        `);

        // Insert welcome notifications
        await queryRunner.query(`
            INSERT INTO "notifications" (
                "id", "title", "message", "type", "priority", "status", "metadata",
                "createdAt", "updatedAt", "userId"
            ) VALUES (
                '50000000-0000-0000-0000-000000000001',
                'Welcome to DataBuddy!',
                'Selamat datang di DataBuddy! Platform ini siap membantu Anda mengelola dan memproses data dengan mudah.',
                'system_maintenance',
                'low',
                'unread',
                '{"welcome": true, "version": "1.0.0"}',
                NOW(),
                NOW(),
                '00000000-0000-0000-0000-000000000001'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "notifications" (
                "id", "title", "message", "type", "priority", "status", "metadata",
                "createdAt", "updatedAt", "userId"
            ) VALUES (
                '50000000-0000-0000-0000-000000000002',
                'Pipeline Templates Available',
                'Beberapa template pipeline telah tersedia untuk membantu Anda memulai. Cek di menu Pipelines.',
                'system_maintenance',
                'low',
                'unread',
                '{"templates": ["CSV Import", "Data Cleaning", "Excel Export"]}',
                NOW(),
                NOW(),
                '00000000-0000-0000-0000-000000000001'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "notifications" (
                "id", "title", "message", "type", "priority", "status", "metadata",
                "createdAt", "updatedAt", "userId"
            ) VALUES (
                '50000000-0000-0000-0000-000000000003',
                'Welcome to DataBuddy!',
                'Akun editor Anda telah dibuat. Anda dapat membuat dan mengelola pipeline serta mengimport data.',
                'system_maintenance',
                'low',
                'unread',
                '{"welcome": true, "role": "editor"}',
                NOW(),
                NOW(),
                '00000000-0000-0000-0000-000000000002'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "notifications" (
                "id", "title", "message", "type", "priority", "status", "metadata",
                "createdAt", "updatedAt", "userId"
            ) VALUES (
                '50000000-0000-0000-0000-000000000004',
                'Welcome to DataBuddy!',
                'Akun viewer Anda telah dibuat. Anda dapat melihat pipeline dan data yang tersedia.',
                'system_maintenance',
                'low',
                'unread',
                '{"welcome": true, "role": "viewer"}',
                NOW(),
                NOW(),
                '00000000-0000-0000-0000-000000000003'
            )
        `);

        // Commit the transaction
        await queryRunner.commitTransaction();
        console.log('✅ Sample data seeded successfully');
    } catch (error) {
        // Rollback on error
        await queryRunner.rollbackTransaction();
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        // Release the query runner
        await queryRunner.release();
    }
}

// Migration interface for TypeORM CLI (legacy support)
export class SeedInitialData1735664400001 implements MigrationInterface {
    name = 'SeedInitialData1735664400001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This is kept for compatibility but we use the standalone function
        const dataSource = queryRunner.connection;
        await seedData(dataSource);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove seeded data
        await queryRunner.query(`DELETE FROM "notifications" WHERE "id" LIKE '50000000-%'`);
        await queryRunner.query(`DELETE FROM "data_exports" WHERE "id" LIKE '40000000-%'`);
        await queryRunner.query(`DELETE FROM "data_imports" WHERE "id" LIKE '30000000-%'`);
        await queryRunner.query(`DELETE FROM "pipeline_steps" WHERE "id" LIKE '20000000-%'`);
        await queryRunner.query(`DELETE FROM "pipelines" WHERE "id" LIKE '10000000-%'`);
        await queryRunner.query(`DELETE FROM "users" WHERE "id" LIKE '00000000-%'`);
    }
}

// Run seeder if called directly
if (require.main === module) {
    runSeeder().catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
}
