import "reflect-metadata";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";

// Import entities directly to avoid module resolution issues
import { User, UserRole, UserStatus } from "./entities/user.entity";
import { Pipeline, PipelineStatus, PipelineType } from "./entities/pipeline.entity";
import { PipelineStep, StepStatus, StepType } from "./entities/pipeline-step.entity";
import { DataImport } from "./entities/data-import.entity";
import { DataExport } from "./entities/data-export.entity";
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from "./entities/notification.entity";
import { PipelineExecution } from "./entities/pipeline-execution.entity";

config();

async function resetAndSeed() {
    console.log("🔄 Starting DataBuddy Factory Reset...");

    const dataSource = new DataSource({
        type: "postgres",
        host: process.env.DATABASE_HOST || "localhost",
        port: parseInt(process.env.DATABASE_PORT || "5432"),
        username: process.env.DATABASE_USERNAME || "postgres",
        password: process.env.DATABASE_PASSWORD || "postgres",
        database: process.env.DATABASE_NAME || "databuddy",
        entities: [User, Pipeline, PipelineStep, DataImport, DataExport, Notification, PipelineExecution],
        synchronize: false,
        logging: false,
    });

    try {
        await dataSource.initialize();
        console.log("✅ Database connected");

        // 1. Clean Database (Truncate all tables)
        // We use CASCADE to clean relations
        console.log("\n🧹 Cleaning existing data...");
        const entities = ["pipeline_executions", "notifications", "data_imports", "data_exports", "pipeline_steps", "pipelines", "users"];

        for (const entity of entities) {
            try {
                await dataSource.query(`TRUNCATE TABLE "${entity}" CASCADE;`);
                console.log(`   - Truncated ${entity}`);
            } catch (e) {
                console.log(`   - Could not truncate ${entity} (might be empty or missing)`);
            }
        }

        // 2. Seed Users
        console.log("\n👥 Seeding Users...");
        const userRepo = dataSource.getRepository(User);
        const saltRounds = 12;

        const users = [
            {
                email: "admin@databuddy.io",
                firstName: "System",
                lastName: "Administrator",
                password: await bcrypt.hash("admin123", saltRounds),
                role: UserRole.ADMIN,
                status: UserStatus.ACTIVE,
                avatar: "https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff"
            },
            {
                email: "analyst@databuddy.io",
                firstName: "Data",
                lastName: "Analyst",
                password: await bcrypt.hash("analyst123", saltRounds),
                role: UserRole.EDITOR,
                status: UserStatus.ACTIVE,
                avatar: "https://ui-avatars.com/api/?name=Data+Analyst&background=10b981&color=fff"
            }
        ];

        const savedUsers = await userRepo.save(userRepo.create(users));
        const adminUser = savedUsers[0];
        console.log(`   - Created ${savedUsers.length} users`);

        // 3. Seed Production Pipelines
        console.log("\n🚀 Seeding Production Blueprints...");
        const pipelineRepo = dataSource.getRepository(Pipeline);
        const stepRepo = dataSource.getRepository(PipelineStep);

        // Pipeline 1: Customer Data Integration
        const etlPipeline = await pipelineRepo.save(pipelineRepo.create({
            name: "Enterprise ETL: Customer Data Integration",
            description: "Standardized extraction, transformation, and loading sequence for enterprise customer records. Includes deduplication and schema validation.",
            type: PipelineType.TRANSFORM,
            status: PipelineStatus.ACTIVE,
            version: 1,
            isTemplate: true,
            category: "Enterprise Integration",
            tags: ["etl", "customer-360", "production"],
            createdById: adminUser.id,
            steps: []
        }));

        await stepRepo.save([
            stepRepo.create({
                name: "Ingest CSV Source",
                type: StepType.READ_FILE,
                status: StepStatus.ACTIVE,
                order: 1,
                config: { format: "csv", delimiter: "," },
                pipeline: etlPipeline
            }),
            stepRepo.create({
                name: "Schema Validation Gate",
                type: StepType.VALIDATE_DATA,
                status: StepStatus.ACTIVE,
                order: 2,
                config: { strict: true, retentionPolicy: "reject_invalid" },
                pipeline: etlPipeline
            }),
            stepRepo.create({
                name: "Deduplication Logic",
                type: StepType.REMOVE_DUPLICATES,
                status: StepStatus.ACTIVE,
                order: 3,
                config: { keys: ["email", "tax_id"] },
                pipeline: etlPipeline
            })
        ]);

        // Pipeline 2: Financial Aggregation
        const financePipeline = await pipelineRepo.save(pipelineRepo.create({
            name: "Financial Data Aggregation",
            description: "Monthly financial rollup process. Aggregates transaction logs into consolidated reporting structures.",
            type: PipelineType.TRANSFORM,
            status: PipelineStatus.ACTIVE,
            version: 2,
            isTemplate: true,
            category: "Finance",
            tags: ["finance", "reporting", "monthly-close"],
            createdById: adminUser.id,
            steps: []
        }));

        await stepRepo.save([
            stepRepo.create({
                name: "Fetch Transaction Logs",
                type: StepType.READ_API,
                status: StepStatus.ACTIVE,
                order: 1,
                config: { endpoint: "/api/financial/transactions", method: "GET" },
                pipeline: financePipeline
            }),
            stepRepo.create({
                name: "Compute Ledger Summaries",
                type: StepType.AGGREGATE_DATA,
                status: StepStatus.ACTIVE,
                order: 2,
                config: { groupBy: ["account_id", "currency"], metrics: ["sum(amount)"] },
                pipeline: financePipeline
            })
        ]);

        console.log("   - Created 2 Enterprise Pipeline Templates");

        // 4. Notifications
        console.log("\n🔔 sending Welcome Notifications...");
        const notificationRepo = dataSource.getRepository(Notification);
        await notificationRepo.save(notificationRepo.create({
            title: "System Initialization Complete",
            message: "DataBuddy Environment has been successfully reset and initialized with production-ready blueprints.",
            type: NotificationType.SYSTEM_MAINTENANCE,
            priority: NotificationPriority.HIGH,
            userId: adminUser.id,
            metadata: { version: "2.0.0-production" }
        }));

        console.log("\n🎉 RESET COMPLETE. Environment is clean and ready.");

    } catch (error) {
        console.error("❌ Reset failed:", error);
    } finally {
        await dataSource.destroy();
    }
}

resetAndSeed();
