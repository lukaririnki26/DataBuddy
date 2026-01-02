import "reflect-metadata";
import { DataSource, In } from "typeorm";
import { config } from "dotenv";

// Entities
import { User } from "../entities/user.entity";
import { Pipeline } from "../entities/pipeline.entity";
import { PipelineStep } from "../entities/pipeline-step.entity";
import { DataImport } from "../entities/data-import.entity";
import { DataExport } from "../entities/data-export.entity";
import { Notification } from "../entities/notification.entity";

// Load environment variables
config({ path: "../../.env" });

// Seed data IDs (matching the seeder)
const SEED_USER_IDS = [
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
    "00000000-0000-0000-0000-000000000003",
];

const SEED_PIPELINE_IDS = [
    "10000000-0000-0000-0000-000000000001",
    "10000000-0000-0000-0000-000000000002",
    "10000000-0000-0000-0000-000000000003",
];

const SEED_PIPELINE_STEP_IDS = [
    "20000000-0000-0000-0000-000000000001",
    "20000000-0000-0000-0000-000000000002",
    "20000000-0000-0000-0000-000000000003",
    "20000000-0000-0000-0000-000000000004",
    "20000000-0000-0000-0000-000000000005",
    "20000000-0000-0000-0000-000000000006",
];

const SEED_DATA_IMPORT_IDS = [
    "30000000-0000-0000-0000-000000000001",
    "30000000-0000-0000-0000-000000000002",
];

const SEED_DATA_EXPORT_IDS = [
    "40000000-0000-0000-0000-000000000001",
];

const SEED_NOTIFICATION_IDS = [
    "50000000-0000-0000-0000-000000000001",
    "50000000-0000-0000-0000-000000000002",
    "50000000-0000-0000-0000-000000000003",
    "50000000-0000-0000-0000-000000000004",
];

async function runSeedDown() {
    console.log("🗑️  Starting DataBuddy Seed Down (Remove Seed Data)...");

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

        await removeSeedData(dataSource);

        console.log("\n🎉 Seed data removed successfully!");
        console.log("=====================================");
        console.log("Removed:");
        console.log("  • 3 Users (Admin, Editor, Viewer)");
        console.log("  • 3 Pipeline Templates");
        console.log("  • 6 Pipeline Steps");
        console.log("  • 2 Sample Data Imports");
        console.log("  • 1 Sample Data Export");
        console.log("  • 4 Welcome Notifications");
    } catch (error) {
        console.error("❌ Seed down failed:", error);
        throw error;
    } finally {
        await dataSource.destroy();
    }
}

async function removeSeedData(dataSource: DataSource) {
    // Use delete() method which doesn't require selecting entities first
    // This avoids column mismatch issues between entity and database

    console.log("\n📦 Removing seed data...");

    // 1. Remove notifications
    const notifResult = await dataSource
        .createQueryBuilder()
        .delete()
        .from(Notification)
        .where("id IN (:...ids)", { ids: SEED_NOTIFICATION_IDS })
        .execute();
    console.log(`✅ Removed ${notifResult.affected || 0} notifications`);

    // 2. Remove pipeline steps
    const stepsResult = await dataSource
        .createQueryBuilder()
        .delete()
        .from(PipelineStep)
        .where("id IN (:...ids)", { ids: SEED_PIPELINE_STEP_IDS })
        .execute();
    console.log(`✅ Removed ${stepsResult.affected || 0} pipeline steps`);

    // 3. Remove data exports
    const exportsResult = await dataSource
        .createQueryBuilder()
        .delete()
        .from(DataExport)
        .where("id IN (:...ids)", { ids: SEED_DATA_EXPORT_IDS })
        .execute();
    console.log(`✅ Removed ${exportsResult.affected || 0} data exports`);

    // 4. Remove data imports
    const importsResult = await dataSource
        .createQueryBuilder()
        .delete()
        .from(DataImport)
        .where("id IN (:...ids)", { ids: SEED_DATA_IMPORT_IDS })
        .execute();
    console.log(`✅ Removed ${importsResult.affected || 0} data imports`);

    // 5. Remove pipelines
    const pipelinesResult = await dataSource
        .createQueryBuilder()
        .delete()
        .from(Pipeline)
        .where("id IN (:...ids)", { ids: SEED_PIPELINE_IDS })
        .execute();
    console.log(`✅ Removed ${pipelinesResult.affected || 0} pipelines`);

    // 6. Remove users (last, since other tables may reference them)
    const usersResult = await dataSource
        .createQueryBuilder()
        .delete()
        .from(User)
        .where("id IN (:...ids)", { ids: SEED_USER_IDS })
        .execute();
    console.log(`✅ Removed ${usersResult.affected || 0} users`);

    console.log("\n✅ All seed data removed successfully!");
}

// Run seed down if called directly
if (require.main === module) {
    runSeedDown().catch((error) => {
        console.error("Seed down failed:", error);
        process.exit(1);
    });
}
