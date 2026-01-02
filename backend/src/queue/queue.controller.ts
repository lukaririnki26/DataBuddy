import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { User } from "../entities/user.entity";
import { Request } from "@nestjs/common";
import { QueueService } from "./queue.service";

/**
 * Queue Controller - Provides endpoints for monitoring queue jobs
 *
 * Endpoints:
 * - GET /queue/stats/:queueName - Get queue statistics
 * - GET /queue/jobs/:queueName/:jobId - Get job status
 * - POST /queue/cleanup/:queueName - Clean old jobs (admin only)
 */
@Controller("queue")
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get("stats/:queueName")
  async getQueueStats(
    @Param("queueName") queueName: string,
    @Request() req: { user: User },
  ) {
    // Only admins can see all queue stats, others can only see their own jobs
    if (
      req.user.role !== "admin" &&
      !["pipeline", "import"].includes(queueName)
    ) {
      throw new Error("Access denied");
    }

    return this.queueService.getQueueStats(queueName);
  }

  @Get("jobs/:queueName/:jobId")
  async getJobStatus(
    @Param("queueName") queueName: string,
    @Param("jobId") jobId: string,
    @Request() req: { user: User },
  ) {
    const job = await this.queueService.getJobStatus(queueName, jobId);

    // Check if user has access to this job
    if (req.user.role !== "admin" && job.data?.userId !== req.user.id) {
      throw new Error("Access denied to this job");
    }

    return job;
  }

  @HttpCode(HttpStatus.OK)
  @Post("cleanup/:queueName")
  async cleanupQueue(
    @Param("queueName") queueName: string,
    @Request() req: { user: User },
  ) {
    // Only admins can perform cleanup
    if (req.user.role !== "admin") {
      throw new Error("Only administrators can perform queue cleanup");
    }

    await this.queueService.cleanOldJobs(queueName);
    return { message: `Cleanup completed for ${queueName} queue` };
  }
}
