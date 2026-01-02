/**
 * Data Module
 *
 * Modul untuk operasi data di DataBuddy yang mencakup:
 * - Upload dan parsing file (CSV, Excel)
 * - Validasi dan cleaning data
 * - Export data dalam berbagai format
 * - Queue management untuk operasi berat
 * - History tracking untuk audit
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { MulterModule } from "@nestjs/platform-express";
import { DataController } from "./data.controller";
import { DataService } from "./data.service";

// Import entities
import { DataImport } from "../../entities/data-import.entity";
import { DataExport } from "../../entities/data-export.entity";
import { User } from "../../entities/user.entity";

// Import notifications service untuk alerting
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    // Register entities untuk akses database
    TypeOrmModule.forFeature([DataImport, DataExport, User]),

    // Import notifications untuk alerting
    NotificationsModule,

    // Konfigurasi file upload dengan multer
    MulterModule.register({
      dest: "./uploads", // Direktori temporary untuk upload
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
      },
    }),

    // Queue untuk background processing
    BullModule.registerQueue(
      {
        name: "import-queue",
      },
      {
        name: "export-queue",
      },
    ),
  ],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService], // Export service agar bisa digunakan di module lain
})
export class DataModule {}
