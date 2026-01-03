/**
 * Pipelines Service
 *
 * Handles business logic for pipeline management (CRUD operations, execution).
 */

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Pipeline } from "../../entities/pipeline.entity";
import { PipelineStep } from "../../entities/pipeline-step.entity";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(Pipeline)
    private pipelineRepository: Repository<Pipeline>,
    @InjectRepository(PipelineStep)
    private pipelineStepRepository: Repository<PipelineStep>,
    private readonly notificationsService: NotificationsService,
  ) { }

  async findAll(filters?: {
    search?: string;
    isActive?: boolean;
    category?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ pipelines: Pipeline[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.pipelineRepository.createQueryBuilder("pipeline")
      .leftJoinAndSelect("pipeline.steps", "steps")
      .leftJoinAndSelect("pipeline.createdBy", "createdBy");

    if (filters?.search) {
      queryBuilder.andWhere("(pipeline.name ILIKE :search OR pipeline.description ILIKE :search)", {
        search: `%${filters.search}%`,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere("pipeline.status = :status", {
        status: filters.isActive ? "active" : "draft",
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere("pipeline.category = :category", { category: filters.category });
    }

    if (filters?.tags && filters.tags.length > 0) {
      // Assuming tags is a jsonb array
      queryBuilder.andWhere("pipeline.tags ?| :tags", { tags: filters.tags });
    }

    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    queryBuilder.orderBy(`pipeline.${sortBy}`, sortOrder as any);

    const [pipelines, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pipelines,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Pipeline> {
    const pipeline = await this.pipelineRepository.findOne({
      where: { id },
      relations: ["steps", "createdBy"],
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline with ID ${id} not found`);
    }

    return pipeline;
  }

  async create(createData: Partial<Pipeline>): Promise<Pipeline> {
    const pipeline = this.pipelineRepository.create(createData);
    const saved = await this.pipelineRepository.save(pipeline);

    await this.notificationsService.notifySystemAlert(
      "New Pipeline Node Created",
      `A new pipeline "${saved.name}" has been added to the system architecture.`,
      undefined, // Priority
      saved.createdById,
    );

    return saved;
  }

  async update(id: string, updateData: Partial<Pipeline>): Promise<Pipeline> {
    const pipeline = await this.findOne(id);
    Object.assign(pipeline, updateData);
    const saved = await this.pipelineRepository.save(pipeline);

    await this.notificationsService.notifySystemAlert(
      "Pipeline Protocol Updated",
      `The configuration for pipeline "${saved.name}" has been modified.`,
      undefined,
      saved.createdById,
    );

    return saved;
  }

  async remove(id: string): Promise<void> {
    const pipeline = await this.findOne(id);
    const name = pipeline.name;
    await this.pipelineRepository.remove(pipeline);

    await this.notificationsService.notifySystemAlert(
      "Pipeline Node Decommissioned",
      `The pipeline "${name}" has been removed from the system core.`,
      undefined,
      pipeline.createdById,
    );
  }

  async duplicate(id: string, userId: string): Promise<Pipeline> {
    const original = await this.findOne(id);
    const clonedData = original.clone();

    return this.create({
      ...clonedData,
      createdById: userId,
    });
  }

  async getStats(): Promise<any> {
    const [total, active] = await Promise.all([
      this.pipelineRepository.count(),
      this.pipelineRepository.count({ where: { status: "active" } as any }),
    ]);

    // Simulated stats for now as we don't have execution logs table yet
    return {
      totalPipelines: total,
      activePipelines: active,
      totalExecutions: 150,
      successfulExecutions: 135,
      failedExecutions: 15,
      averageExecutionTime: 45.5,
    };
  }

  async getTemplates(): Promise<Pipeline[]> {
    return this.pipelineRepository.find({
      where: { isTemplate: true } as any,
      relations: ["steps"],
    });
  }

  async getCategories(): Promise<string[]> {
    const result = await this.pipelineRepository
      .createQueryBuilder("pipeline")
      .select("DISTINCT pipeline.category", "category")
      .where("pipeline.category IS NOT NULL")
      .getRawMany();

    return result.map((r) => r.category);
  }

  async getTags(): Promise<string[]> {
    // This is for jsonb tags array
    const result = await this.pipelineRepository.query(`
      SELECT DISTINCT unnest(tags) as tag 
      FROM pipelines 
      WHERE tags IS NOT NULL
    `);

    return result.map((r) => r.tag);
  }
}
