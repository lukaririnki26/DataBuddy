import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1735664400000 implements MigrationInterface {
    name = "CreateInitialSchema1735664400000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM types first
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'editor', 'viewer')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."pipelines_type_enum" AS ENUM('import', 'export', 'transform', 'hybrid')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."pipelines_status_enum" AS ENUM('draft', 'active', 'archived')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."pipeline_steps_type_enum" AS ENUM(
                'read_file', 'write_file', 'read_api', 'write_api',
                'transform_columns', 'filter_rows', 'sort_data', 'group_data', 'join_datasets',
                'validate_data', 'clean_data', 'remove_duplicates', 'fill_missing_values',
                'aggregate_data', 'calculate_metrics', 'apply_formula',
                'custom_script', 'conditional_branch', 'loop_iteration'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."pipeline_steps_status_enum" AS ENUM('active', 'disabled', 'error')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."data_imports_status_enum" AS ENUM('pending', 'processing', 'validating', 'transforming', 'completed', 'failed', 'cancelled')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."data_imports_sourcetype_enum" AS ENUM('file_upload', 'url_download', 'api_endpoint', 'database_query', 'stream')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."data_imports_fileformat_enum" AS ENUM('csv', 'xlsx', 'xls', 'json', 'xml', 'txt')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."data_exports_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."data_exports_destinationtype_enum" AS ENUM('file_download', 'email_attachment', 'ftp_upload', 'api_endpoint', 'cloud_storage')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."notifications_type_enum" AS ENUM(
                'import_completed', 'import_failed', 'export_completed', 'export_failed',
                'pipeline_executed', 'pipeline_failed', 'system_error', 'system_maintenance',
                'user_invitation', 'data_validation_error'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."notifications_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."notifications_status_enum" AS ENUM('unread', 'read', 'archived')
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(100) NOT NULL,
                "firstName" character varying(100) NOT NULL,
                "lastName" character varying(100) NOT NULL,
                "password" character varying(255) NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'viewer',
                "status" "public"."users_status_enum" NOT NULL DEFAULT 'active',
                "avatar" text,
                "lastLoginAt" TIMESTAMP,
                "lastLoginIp" character varying(45),
                "preferences" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for users table
        await queryRunner.query(`
            CREATE INDEX "IDX_88bd96abac20491a2cb1b79b7b" ON "users" ("role", "status")
        `);

        // Create pipelines table
        await queryRunner.query(`
            CREATE TABLE "pipelines" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(200) NOT NULL,
                "description" text,
                "type" "public"."pipelines_type_enum" NOT NULL DEFAULT 'transform',
                "status" "public"."pipelines_status_enum" NOT NULL DEFAULT 'draft',
                "config" jsonb,
                "inputSchema" jsonb,
                "outputSchema" jsonb,
                "version" integer NOT NULL DEFAULT 0,
                "isTemplate" boolean NOT NULL DEFAULT false,
                "category" character varying(100),
                "tags" jsonb,
                "executionCount" integer NOT NULL DEFAULT 0,
                "totalProcessedRows" bigint NOT NULL DEFAULT 0,
                "averageExecutionTime" real,
                "lastExecutedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdById" uuid NOT NULL,
                CONSTRAINT "PK_3a6aecfdf1e1cd9fc39b0a9a9f2" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for pipelines table
        await queryRunner.query(`
            CREATE INDEX "IDX_96aac72f1574b8872991fab0a9a" ON "pipelines" ("createdById", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_88bd96abac20491a2cb1b79b7ba" ON "pipelines" ("type", "status")
        `);

        // Create pipeline_steps table
        await queryRunner.query(`
            CREATE TABLE "pipeline_steps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(200) NOT NULL,
                "description" text,
                "type" "public"."pipeline_steps_type_enum" NOT NULL,
                "status" "public"."pipeline_steps_status_enum" NOT NULL DEFAULT 'active',
                "order" integer NOT NULL,
                "config" jsonb NOT NULL,
                "inputMapping" jsonb,
                "outputMapping" jsonb,
                "conditions" jsonb,
                "continueOnError" boolean NOT NULL DEFAULT false,
                "retryCount" integer NOT NULL DEFAULT 0,
                "timeoutSeconds" integer,
                "executionCount" bigint NOT NULL DEFAULT 0,
                "averageExecutionTime" real,
                "lastExecutedAt" TIMESTAMP,
                "lastErrorMessage" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "pipelineId" uuid NOT NULL,
                CONSTRAINT "PK_8b3f3c0b6f3c6b3f3c6b3f3c6b3" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for pipeline_steps table
        await queryRunner.query(`
            CREATE INDEX "IDX_8b3f3c0b6f3c6b3f3c6b3f3c6b4" ON "pipeline_steps" ("pipelineId", "order")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_8b3f3c0b6f3c6b3f3c6b3f3c6b5" ON "pipeline_steps" ("type", "status")
        `);

        // Create data_imports table
        await queryRunner.query(`
            CREATE TABLE "data_imports" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(200) NOT NULL,
                "description" text,
                "status" "public"."data_imports_status_enum" NOT NULL DEFAULT 'pending',
                "sourceType" "public"."data_imports_sourcetype_enum" NOT NULL,
                "fileFormat" "public"."data_imports_fileformat_enum",
                "sourcePath" character varying(500),
                "originalFileName" character varying(500),
                "filePath" character varying(500),
                "filename" character varying(255),
                "mimeType" character varying(100),
                "fileSize" bigint,
                "importConfig" jsonb,
                "dataPreview" jsonb,
                "totalRows" integer NOT NULL DEFAULT 0,
                "processedRows" integer NOT NULL DEFAULT 0,
                "errorRows" integer NOT NULL DEFAULT 0,
                "skippedRows" integer NOT NULL DEFAULT 0,
                "columnMapping" jsonb,
                "validationRules" jsonb,
                "transformationRules" jsonb,
                "targetTable" character varying(100),
                "errorMessage" text,
                "errorDetails" jsonb,
                "errors" jsonb,
                "columns" jsonb,
                "progressPercentage" real,
                "startedAt" TIMESTAMP,
                "completedAt" TIMESTAMP,
                "durationSeconds" real,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdById" uuid NOT NULL,
                CONSTRAINT "PK_1b1b1b1b1b1b1b1b1b1b1b1b1b1" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for data_imports table
        await queryRunner.query(`
            CREATE INDEX "IDX_1b1b1b1b1b1b1b1b1b1b1b1b1b2" ON "data_imports" ("createdById", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_1b1b1b1b1b1b1b1b1b1b1b1b1b3" ON "data_imports" ("status", "createdAt")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_1b1b1b1b1b1b1b1b1b1b1b1b1b4" ON "data_imports" ("sourceType", "fileFormat")
        `);

        // Create data_exports table
        await queryRunner.query(`
            CREATE TABLE "data_exports" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(200) NOT NULL,
                "description" text,
                "status" "public"."data_exports_status_enum" NOT NULL DEFAULT 'pending',
                "destinationType" "public"."data_exports_destinationtype_enum" NOT NULL,
                "fileFormat" "public"."data_exports_fileformat_enum" NOT NULL,
                "destinationPath" character varying(500),
                "outputFileName" character varying(500),
                "filename" character varying(255),
                "exportConfig" jsonb,
                "dataQuery" jsonb,
                "totalRows" integer NOT NULL DEFAULT 0,
                "processedRows" integer NOT NULL DEFAULT 0,
                "errorRows" integer NOT NULL DEFAULT 0,
                "outputFileSize" bigint,
                "columnSelection" jsonb,
                "transformationRules" jsonb,
                "sourceTable" character varying(100),
                "errorMessage" text,
                "errorDetails" jsonb,
                "progressPercentage" real,
                "startedAt" TIMESTAMP,
                "completedAt" TIMESTAMP,
                "durationSeconds" real,
                "downloadUrl" character varying(500),
                "downloadUrlExpiresAt" TIMESTAMP,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdById" uuid NOT NULL,
                CONSTRAINT "PK_2b2b2b2b2b2b2b2b2b2b2b2b2b2" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for data_exports table
        await queryRunner.query(`
            CREATE INDEX "IDX_2b2b2b2b2b2b2b2b2b2b2b2b2b3" ON "data_exports" ("createdById", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_2b2b2b2b2b2b2b2b2b2b2b2b2b4" ON "data_exports" ("status", "createdAt")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_2b2b2b2b2b2b2b2b2b2b2b2b2b5" ON "data_exports" ("destinationType", "fileFormat")
        `);

        // Create notifications table
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(200) NOT NULL,
                "message" text NOT NULL,
                "type" "public"."notifications_type_enum" NOT NULL,
                "priority" "public"."notifications_priority_enum" NOT NULL DEFAULT 'medium',
                "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'unread',
                "metadata" jsonb,
                "actionUrl" character varying(500),
                "emailSent" boolean NOT NULL DEFAULT false,
                "emailSentAt" TIMESTAMP,
                "pushSent" boolean NOT NULL DEFAULT false,
                "pushSentAt" TIMESTAMP,
                "expiresAt" TIMESTAMP,
                "readAt" TIMESTAMP,
                "archivedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_4a72e9607c8686fe6b0241d49e9" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for notifications table
        await queryRunner.query(`
            CREATE INDEX "IDX_4a72e9607c8686fe6b0241d49ea" ON "notifications" ("userId", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_4a72e9607c8686fe6b0241d49eb" ON "notifications" ("type", "createdAt")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_4a72e9607c8686fe6b0241d49ec" ON "notifications" ("priority", "status")
        `);

        // Create foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "pipelines"
            ADD CONSTRAINT "FK_96aac72f1574b8872991fab0a9a"
            FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "pipeline_steps"
            ADD CONSTRAINT "FK_8b3f3c0b6f3c6b3f3c6b3f3c6b4"
            FOREIGN KEY ("pipelineId") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "data_imports"
            ADD CONSTRAINT "FK_1b1b1b1b1b1b1b1b1b1b1b1b1b2"
            FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "data_exports"
            ADD CONSTRAINT "FK_2b2b2b2b2b2b2b2b2b2b2b2b2b3"
            FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "notifications"
            ADD CONSTRAINT "FK_4a72e9607c8686fe6b0241d49e9"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(
            `ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_4a72e9607c8686fe6b0241d49e9"`,
        );
        await queryRunner.query(
            `ALTER TABLE "data_exports" DROP CONSTRAINT IF EXISTS "FK_2b2b2b2b2b2b2b2b2b2b2b2b2b3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "data_imports" DROP CONSTRAINT IF EXISTS "FK_1b1b1b1b1b1b1b1b1b1b1b1b1b2"`,
        );
        await queryRunner.query(
            `ALTER TABLE "pipeline_steps" DROP CONSTRAINT IF EXISTS "FK_8b3f3c0b6f3c6b3f3c6b3f3c6b4"`,
        );
        await queryRunner.query(
            `ALTER TABLE "pipelines" DROP CONSTRAINT IF EXISTS "FK_96aac72f1574b8872991fab0a9a"`,
        );

        // Drop indexes BEFORE dropping tables (indexes are on tables)
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_4a72e9607c8686fe6b0241d49ec"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_4a72e9607c8686fe6b0241d49eb"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_4a72e9607c8686fe6b0241d49ea"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_2b2b2b2b2b2b2b2b2b2b2b2b2b5"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_2b2b2b2b2b2b2b2b2b2b2b2b2b4"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_2b2b2b2b2b2b2b2b2b2b2b2b2b3"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_1b1b1b1b1b1b1b1b1b1b1b1b1b4"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_1b1b1b1b1b1b1b1b1b1b1b1b1b3"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_1b1b1b1b1b1b1b1b1b1b1b1b1b2"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_8b3f3c0b6f3c6b3f3c6b3f3c6b5"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_8b3f3c0b6f3c6b3f3c6b3f3c6b4"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_88bd96abac20491a2cb1b79b7ba"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_96aac72f1574b8872991fab0a9a"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_88bd96abac20491a2cb1b79b7b"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_96aac72f1574b8872991fab0a9"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "data_exports"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "data_imports"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "pipeline_steps"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "pipelines"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

        // Drop ENUM types
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."notifications_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."notifications_priority_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."notifications_type_enum"`);
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."data_exports_destinationtype_enum"`,
        );
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."data_exports_status_enum"`);
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."data_imports_fileformat_enum"`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."data_imports_sourcetype_enum"`,
        );
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."data_imports_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."pipeline_steps_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."pipeline_steps_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."pipelines_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."pipelines_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
    }
}
