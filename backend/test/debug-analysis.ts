import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";

// Entities
import { User } from "./entities/user.entity";
import { Pipeline } from "./entities/pipeline.entity";
import { PipelineStep } from "./entities/pipeline-step.entity";
import { PipelineExecution } from "./entities/pipeline-execution.entity";
import { Notification } from "./entities/notification.entity";
import { DataImport } from "./entities/data-import.entity";
import { DataExport } from "./entities/data-export.entity";

// Services
import { PipelineRunnerService } from "./modules/pipelines/pipeline-runner.service";
import { PipelinesService } from "./modules/pipelines/pipelines.service";
import { PipelineExecutionsService } from "./modules/pipelines/pipeline-executions.service";
import { NotificationsService } from "./modules/notifications/notifications.service";
import { PipelineStepFactory } from "./modules/pipelines/pipeline-step.factory";

config();

async function debugAnalysis() {
    console.log("🐞 Starting Analysis Debugger...");

    const dataSource = new DataSource({
        type: "postgres",
        host: process.env.DATABASE_HOST || "localhost",
        port: parseInt(process.env.DATABASE_PORT || "5432"),
        username: process.env.DATABASE_USERNAME || "postgres",
        password: process.env.DATABASE_PASSWORD || "postgres",
        database: process.env.DATABASE_NAME || "databuddy",
        entities: [User, Pipeline, PipelineStep, PipelineExecution, Notification, DataImport, DataExport],
        synchronize: false,
        logging: false,
    });

    try {
        await dataSource.initialize();

        // Setup Services manually (no NestJS context)
        const pipelineRepo = dataSource.getRepository(Pipeline);
        const stepRepo = dataSource.getRepository(PipelineStep);
        const executionRepo = dataSource.getRepository(PipelineExecution);
        const notificationRepo = dataSource.getRepository(Notification);

        // Mock Notifications Service dependencies
        const mockUserRepo = {} as any;
        const mockWebSocket = { emitNotification: async () => { }, emitNotificationStats: async () => { } } as any;
        const notificationsService = new NotificationsService(notificationRepo, mockUserRepo, mockWebSocket);

        // Real Services
        const pipelinesService = new PipelinesService(pipelineRepo, stepRepo, notificationsService);
        const executionsService = new PipelineExecutionsService(executionRepo);
        const stepFactory = new PipelineStepFactory();

        const runnerService = new PipelineRunnerService(
            notificationsService,
            pipelinesService,
            stepFactory,
            executionsService
        );

        // Get Admin User
        const userRepo = dataSource.getRepository(User);
        const admin = await userRepo.findOne({ where: { email: "admin@databuddy.io" } });
        if (!admin) throw new Error("Admin user not found - did you run reset-and-seed?");

        // Get Financial Pipeline
        const pipeline = await pipelineRepo.findOne({ where: { name: "Financial Data Aggregation" } });
        if (!pipeline) throw new Error("Financial Pipeline not found");

        console.log(`\n▶️ Executing Pipeline: ${pipeline.name} (${pipeline.id})`);

        const result = await runnerService.execute(pipeline.id, [], admin.id);

        console.log("\n📊 Execution Result:");
        console.log(`   Success: ${result.success}`);
        console.log(`   Execution Time: ${result.executionTime}ms`);
        console.log(`   Processed Items: ${result.processedItems}`);

        if (result.errors && result.errors.length > 0) {
            console.error("   ❌ Errors:", JSON.stringify(result.errors, null, 2));
        } else {
            console.log("   ✅ No Errors");
            // console.log("   Data:", JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.error("❌ Debug failed:", error);
    } finally {
        await dataSource.destroy();
    }
}

debugAnalysis();
