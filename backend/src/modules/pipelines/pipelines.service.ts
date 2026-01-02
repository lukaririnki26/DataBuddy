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

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(Pipeline)
    private pipelineRepository: Repository<Pipeline>,
    @InjectRepository(PipelineStep)
    private pipelineStepRepository: Repository<PipelineStep>,
  ) {}

  async findAll(): Promise<Pipeline[]> {
    return this.pipelineRepository.find({
      relations: ["steps", "createdBy"],
      order: { createdAt: "DESC" },
    });
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
    return this.pipelineRepository.save(pipeline);
  }

  async update(id: string, updateData: Partial<Pipeline>): Promise<Pipeline> {
    const pipeline = await this.findOne(id);
    Object.assign(pipeline, updateData);
    return this.pipelineRepository.save(pipeline);
  }

  async remove(id: string): Promise<void> {
    const pipeline = await this.findOne(id);
    await this.pipelineRepository.remove(pipeline);
  }

  async duplicate(id: string, userId: string): Promise<Pipeline> {
    const original = await this.findOne(id);
    const cloned = original.clone();
    cloned.name = `${original.name} (Copy)`;
    cloned.createdById = userId;
    return this.create(cloned);
  }
}
