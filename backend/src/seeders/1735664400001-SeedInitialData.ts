import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import * as bcrypt from "bcrypt";

// Entities
import { User, UserRole, UserStatus } from "../entities/user.entity";
import { Pipeline, PipelineStatus, PipelineType } from "../entities/pipeline.entity";
import { PipelineStep, StepStatus, StepType } from "../entities/pipeline-step.entity";
import { DataImport, ImportStatus, ImportSourceType, FileFormat } from "../entities/data-import.entity";
import { DataExport, ExportStatus, ExportDestinationType } from "../entities/data-export.entity";
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from "../entities/notification.entity";

// Load environment variables
config({ path: "../../.env" });

async function runSeeder() {
  console.log("🌱 Starting DataBuddy Database Seeder...");

  // Create database connection  
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: process.env.DATABASE_NAME || "databuddy",
    synchronize: false,
    logging: false,
    entities: [User, Pipeline, PipelineStep, DataImport, DataExport, Notification],
  });

  try {
    await dataSource.initialize();
    console.log("✅ Database connection established");

    await seedData(dataSource);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("=====================================");
    console.log("Created:");
    console.log("  • 3 Users (Admin, Editor, Viewer)");
    console.log("  • 3 Pipeline Templates");
    console.log("  • 6 Pipeline Steps");
    console.log("  • 2 Sample Data Imports");
    console.log("  • 1 Sample Data Export");
    console.log("  • 4 Welcome Notifications");
    console.log("");
    console.log("Login credentials:");
    console.log("  Admin: admin@databuddy.com / admin123");
    console.log("  Editor: editor@databuddy.com / editor123");
    console.log("  Viewer: viewer@databuddy.com / viewer123");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

async function seedData(dataSource: DataSource) {
  // Get repositories
  const userRepo = dataSource.getRepository(User);
  const pipelineRepo = dataSource.getRepository(Pipeline);
  const pipelineStepRepo = dataSource.getRepository(PipelineStep);
  const dataImportRepo = dataSource.getRepository(DataImport);
  const dataExportRepo = dataSource.getRepository(DataExport);
  const notificationRepo = dataSource.getRepository(Notification);

  // Check if data already exists
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    console.log("⚠️  Data already exists. Skipping seeding.");
    return;
  }

  // ============================================================
  // SEED USERS
  // ============================================================
  console.log("\n📦 Seeding users...");

  // Pre-hash passwords (User entity has @BeforeInsert hook, but we need control)
  const saltRounds = 12;
  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const editorPassword = await bcrypt.hash("editor123", saltRounds);
  const viewerPassword = await bcrypt.hash("viewer123", saltRounds);

  const adminUser = userRepo.create({
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@databuddy.com",
    firstName: "Admin",
    lastName: "DataBuddy",
    password: adminPassword, // Already hashed, entity hook will skip
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    preferences: { theme: "light", language: "en", timezone: "UTC" },
  });
  await userRepo.save(adminUser);
  console.log("✅ Admin user created");

  const editorUser = userRepo.create({
    id: "00000000-0000-0000-0000-000000000002",
    email: "editor@databuddy.com",
    firstName: "Jane",
    lastName: "Editor",
    password: editorPassword,
    role: UserRole.EDITOR,
    status: UserStatus.ACTIVE,
    preferences: { theme: "dark", language: "en", timezone: "UTC" },
  });
  await userRepo.save(editorUser);
  console.log("✅ Editor user created");

  const viewerUser = userRepo.create({
    id: "00000000-0000-0000-0000-000000000003",
    email: "viewer@databuddy.com",
    firstName: "John",
    lastName: "Viewer",
    password: viewerPassword,
    role: UserRole.VIEWER,
    status: UserStatus.ACTIVE,
    preferences: { theme: "light", language: "en", timezone: "UTC" },
  });
  await userRepo.save(viewerUser);
  console.log("✅ Viewer user created");

  // ============================================================
  // SEED PIPELINE TEMPLATES
  // ============================================================
  console.log("\n📦 Seeding pipeline templates...");

  const csvImportPipeline = pipelineRepo.create({
    id: "10000000-0000-0000-0000-000000000001",
    name: "CSV Data Import Template",
    description: "Template untuk mengimport data CSV dengan validasi dasar",
    type: PipelineType.IMPORT,
    status: PipelineStatus.ACTIVE,
    config: { autoValidate: true, skipErrors: false },
    inputSchema: { type: "object", properties: { file: { type: "string", format: "binary" } } },
    outputSchema: { type: "array", items: { type: "object" } },
    version: 1,
    isTemplate: true,
    category: "Import",
    tags: ["csv", "import", "template", "data-processing"],
    createdById: adminUser.id,
  });
  await pipelineRepo.save(csvImportPipeline);

  const dataCleaningPipeline = pipelineRepo.create({
    id: "10000000-0000-0000-0000-000000000002",
    name: "Data Cleaning Pipeline",
    description: "Pipeline untuk membersihkan dan menstandardisasi data",
    type: PipelineType.TRANSFORM,
    status: PipelineStatus.ACTIVE,
    config: { strictMode: false },
    inputSchema: { type: "array", items: { type: "object" } },
    outputSchema: { type: "array", items: { type: "object" } },
    version: 1,
    isTemplate: true,
    category: "Data Quality",
    tags: ["cleaning", "transform", "data-quality", "standardization"],
    createdById: adminUser.id,
  });
  await pipelineRepo.save(dataCleaningPipeline);

  const excelExportPipeline = pipelineRepo.create({
    id: "10000000-0000-0000-0000-000000000003",
    name: "Excel Export Pipeline",
    description: "Pipeline untuk mengekspor data ke format Excel",
    type: PipelineType.EXPORT,
    status: PipelineStatus.ACTIVE,
    config: { includeHeaders: true, autoFormat: true },
    inputSchema: { type: "array", items: { type: "object" } },
    outputSchema: { type: "string", format: "binary" },
    version: 1,
    isTemplate: true,
    category: "Export",
    tags: ["excel", "export", "xlsx", "data-export"],
    createdById: adminUser.id,
  });
  await pipelineRepo.save(excelExportPipeline);
  console.log("✅ Pipeline templates created");

  // ============================================================
  // SEED PIPELINE STEPS
  // ============================================================
  console.log("\n📦 Seeding pipeline steps...");

  // Steps for CSV Import Pipeline
  const step1 = pipelineStepRepo.create({
    id: "20000000-0000-0000-0000-000000000001",
    name: "Read CSV File",
    description: "Membaca file CSV dari input",
    type: StepType.READ_FILE,
    status: StepStatus.ACTIVE,
    order: 1,
    config: { fileFormat: "csv", hasHeader: true, encoding: "utf8", delimiter: "," },
    continueOnError: false,
    retryCount: 3,
    timeoutSeconds: 300,
    pipelineId: csvImportPipeline.id,
  });
  await pipelineStepRepo.save(step1);

  const step2 = pipelineStepRepo.create({
    id: "20000000-0000-0000-0000-000000000002",
    name: "Validate Data",
    description: "Memvalidasi struktur dan tipe data",
    type: StepType.VALIDATE_DATA,
    status: StepStatus.ACTIVE,
    order: 2,
    config: {
      rules: [
        { type: "required", column: "name", message: "Name is required" },
        { type: "email", column: "email" },
      ],
    },
    continueOnError: false,
    retryCount: 0,
    timeoutSeconds: 60,
    pipelineId: csvImportPipeline.id,
  });
  await pipelineStepRepo.save(step2);

  // Steps for Data Cleaning Pipeline
  const step3 = pipelineStepRepo.create({
    id: "20000000-0000-0000-0000-000000000003",
    name: "Clean Text Data",
    description: "Membersihkan dan menstandardisasi data teks",
    type: StepType.TRANSFORM_COLUMNS,
    status: StepStatus.ACTIVE,
    order: 1,
    config: {
      columns: ["name", "description"],
      trim: true,
      lowercase: false,
      removeExtraSpaces: true,
    },
    continueOnError: true,
    retryCount: 0,
    timeoutSeconds: 120,
    pipelineId: dataCleaningPipeline.id,
  });
  await pipelineStepRepo.save(step3);

  const step4 = pipelineStepRepo.create({
    id: "20000000-0000-0000-0000-000000000004",
    name: "Check Duplicates",
    description: "Mengecek dan menghapus data duplikat",
    type: StepType.REMOVE_DUPLICATES,
    status: StepStatus.ACTIVE,
    order: 2,
    config: { columns: ["id", "email"], action: "remove" },
    continueOnError: true,
    retryCount: 0,
    timeoutSeconds: 60,
    pipelineId: dataCleaningPipeline.id,
  });
  await pipelineStepRepo.save(step4);

  // Steps for Excel Export Pipeline
  const step5 = pipelineStepRepo.create({
    id: "20000000-0000-0000-0000-000000000005",
    name: "Format Data for Export",
    description: "Memformat data sebelum diekspor",
    type: StepType.TRANSFORM_COLUMNS,
    status: StepStatus.ACTIVE,
    order: 1,
    config: {
      mappings: { created_at: "createdAt", updated_at: "updatedAt" },
      dateFormat: "YYYY-MM-DD",
    },
    continueOnError: false,
    retryCount: 0,
    timeoutSeconds: 60,
    pipelineId: excelExportPipeline.id,
  });
  await pipelineStepRepo.save(step5);

  const step6 = pipelineStepRepo.create({
    id: "20000000-0000-0000-0000-000000000006",
    name: "Export to Excel",
    description: "Mengekspor data ke file Excel",
    type: StepType.WRITE_FILE,
    status: StepStatus.ACTIVE,
    order: 2,
    config: { format: "xlsx", sheetName: "Data", includeHeaders: true },
    continueOnError: false,
    retryCount: 2,
    timeoutSeconds: 300,
    pipelineId: excelExportPipeline.id,
  });
  await pipelineStepRepo.save(step6);
  console.log("✅ Pipeline steps created");

  // ============================================================
  // SEED DATA IMPORTS
  // ============================================================
  console.log("\n📦 Seeding data imports...");

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  // Use QueryBuilder insert to avoid entity-database column mismatch
  await dataSource
    .createQueryBuilder()
    .insert()
    .into("data_imports")
    .values([
      {
        id: "30000000-0000-0000-0000-000000000001",
        name: "Sample Customer Data",
        description: "Contoh data pelanggan untuk testing",
        status: "completed",
        sourceType: "file_upload",
        fileFormat: "csv",
        originalFileName: "customers.csv",
        totalRows: 1000,
        processedRows: 1000,
        createdById: adminUser.id,
        createdAt: twoDaysAgo,
        updatedAt: twoDaysAgo,
      },
      {
        id: "30000000-0000-0000-0000-000000000002",
        name: "Product Inventory",
        description: "Data inventori produk",
        status: "completed",
        sourceType: "file_upload",
        fileFormat: "xlsx",
        originalFileName: "inventory.xlsx",
        totalRows: 500,
        processedRows: 500,
        createdById: editorUser.id,
        createdAt: oneDayAgo,
        updatedAt: oneDayAgo,
      },
    ])
    .execute();
  console.log("✅ Data imports created");

  // ============================================================
  // SEED DATA EXPORTS
  // ============================================================
  // Use QueryBuilder insert to avoid entity-database column mismatch
  await dataSource
    .createQueryBuilder()
    .insert()
    .into("data_exports")
    .values([
      {
        id: "40000000-0000-0000-0000-000000000001",
        name: "Customer Report",
        description: "Laporan data pelanggan untuk manajemen",
        status: "completed",
        destinationType: "file_download",
        fileFormat: "xlsx",
        outputFileName: "customer_report.xlsx",
        totalRows: 1000,
        processedRows: 1000,
        createdById: adminUser.id,
        createdAt: oneDayAgo,
        updatedAt: oneDayAgo,
      },
    ])
    .execute();
  console.log("✅ Data exports created");

  // ============================================================
  // SEED NOTIFICATIONS
  // ============================================================
  console.log("\n📦 Seeding notifications...");

  // Use QueryBuilder insert to avoid entity-database column mismatch
  await dataSource
    .createQueryBuilder()
    .insert()
    .into("notifications")
    .values([
      {
        id: "50000000-0000-0000-0000-000000000001",
        title: "Welcome to DataBuddy!",
        message: "Selamat datang di DataBuddy! Platform ini siap membantu Anda mengelola dan memproses data dengan mudah.",
        type: "system_maintenance",
        priority: "low",
        status: "unread",
        metadata: { welcome: true, version: "1.0.0" },
        userId: adminUser.id,
      },
      {
        id: "50000000-0000-0000-0000-000000000002",
        title: "Pipeline Templates Available",
        message: "Beberapa template pipeline telah tersedia untuk membantu Anda memulai. Cek di menu Pipelines.",
        type: "system_maintenance",
        priority: "low",
        status: "unread",
        metadata: { templates: ["CSV Import", "Data Cleaning", "Excel Export"] },
        userId: adminUser.id,
      },
      {
        id: "50000000-0000-0000-0000-000000000003",
        title: "Welcome to DataBuddy!",
        message: "Akun editor Anda telah dibuat. Anda dapat membuat dan mengelola pipeline serta mengimport data.",
        type: "system_maintenance",
        priority: "low",
        status: "unread",
        metadata: { welcome: true, role: "editor" },
        userId: editorUser.id,
      },
      {
        id: "50000000-0000-0000-0000-000000000004",
        title: "Welcome to DataBuddy!",
        message: "Akun viewer Anda telah dibuat. Anda dapat melihat pipeline dan data yang tersedia.",
        type: "system_maintenance",
        priority: "low",
        status: "unread",
        metadata: { welcome: true, role: "viewer" },
        userId: viewerUser.id,
      },
    ])
    .execute();
  console.log("✅ Notifications created");

  console.log("\n✅ All seed data created successfully!");
}

// Run seeder if called directly
if (require.main === module) {
  runSeeder().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}
