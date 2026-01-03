import {
    Controller,
    Get,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PipelineExecutionsService } from './pipeline-executions.service';

@ApiTags('Pipeline Executions')
@ApiBearerAuth()
@Controller('pipeline-executions')
@UseGuards(JwtAuthGuard)
export class PipelineExecutionsController {
    constructor(private readonly executionsService: PipelineExecutionsService) { }

    @Get(':id')
    @ApiOperation({ summary: 'Get execution details by ID' })
    async findOne(@Param('id') id: string) {
        return this.executionsService.findOne(id);
    }
}

@ApiTags('Pipelines')
@ApiBearerAuth()
@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelineHistoryController {
    constructor(private readonly executionsService: PipelineExecutionsService) { }

    @Get(':id/history')
    @ApiOperation({ summary: 'Get execution history for a pipeline' })
    async getHistory(@Param('id') id: string) {
        return this.executionsService.findAll(id);
    }
}
