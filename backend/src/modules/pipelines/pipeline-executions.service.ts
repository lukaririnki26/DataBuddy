import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipelineExecution, ExecutionStatus } from '../../entities/pipeline-execution.entity';

@Injectable()
export class PipelineExecutionsService {
    constructor(
        @InjectRepository(PipelineExecution)
        private executionRepository: Repository<PipelineExecution>,
    ) { }

    async findAll(pipelineId: string): Promise<PipelineExecution[]> {
        return this.executionRepository.find({
            where: { pipelineId },
            order: { createdAt: 'DESC' },
            relations: ['user'],
        });
    }

    async findOne(id: string): Promise<PipelineExecution> {
        const execution = await this.executionRepository.findOne({
            where: { id },
            relations: ['user', 'pipeline'],
        });

        if (!execution) {
            throw new NotFoundException(`Execution log ${id} not found`);
        }

        return execution;
    }

    async createExecutionRecord(
        pipelineId: string,
        userId: string | null,
        inputData: any,
    ): Promise<PipelineExecution> {
        const execution = this.executionRepository.create({
            pipelineId,
            userId,
            startTime: new Date(),
            status: ExecutionStatus.RUNNING,
            inputSnapshot: inputData,
        });

        return this.executionRepository.save(execution);
    }

    async updateExecutionRecord(
        id: string,
        updateData: Partial<PipelineExecution>,
    ): Promise<PipelineExecution> {
        const execution = await this.findOne(id);
        Object.assign(execution, updateData);
        return this.executionRepository.save(execution);
    }

    async finishExecution(
        id: string,
        status: ExecutionStatus,
        outputData: any,
        logs: any[],
        error?: string,
    ): Promise<PipelineExecution> {
        const execution = await this.findOne(id);
        const endTime = new Date();

        execution.status = status;
        execution.endTime = endTime;
        execution.durationMs = endTime.getTime() - execution.startTime.getTime();
        execution.outputSnapshot = outputData;
        execution.logs = logs;
        execution.error = error;

        return this.executionRepository.save(execution);
    }
}
