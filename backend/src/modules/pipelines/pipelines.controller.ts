/**
 * Pipelines Controller
 *
 * Handles HTTP requests for pipeline management and execution.
 * All endpoints are protected by JwtAuthGuard.
 */

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    NotFoundException,
} from "@nestjs/common";
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { PipelinesService } from "./pipelines.service";
import { PipelineRunnerService } from "./pipeline-runner.service";
import { Pipeline } from "../../entities/pipeline.entity";

@ApiTags("Pipelines")
@ApiBearerAuth()
@Controller("pipelines")
@UseGuards(JwtAuthGuard)
export class PipelinesController {
    constructor(
        private readonly pipelinesService: PipelinesService,
        private readonly pipelineRunnerService: PipelineRunnerService,
    ) { }

    @Get()
    @ApiOperation({ summary: "Get all pipelines with filtering and pagination" })
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "isActive", required: false, type: Boolean })
    @ApiQuery({ name: "category", required: false })
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "limit", required: false, type: Number })
    async findAll(@Query() query: any) {
        const filters = {
            search: query.search,
            isActive: query.isActive === "true" ? true : query.isActive === "false" ? false : undefined,
            category: query.category,
            page: query.page ? parseInt(query.page, 10) : 1,
            limit: query.limit ? parseInt(query.limit, 10) : 10,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        };
        return this.pipelinesService.findAll(filters);
    }

    @Get("stats")
    @ApiOperation({ summary: "Get pipeline execution statistics" })
    async getStats() {
        return this.pipelinesService.getStats();
    }

    @Get("templates")
    @ApiOperation({ summary: "Get all pipeline templates" })
    async getTemplates() {
        return { templates: await this.pipelinesService.getTemplates() };
    }

    @Get("categories")
    @ApiOperation({ summary: "Get all unique pipeline categories" })
    async getCategories() {
        return this.pipelinesService.getCategories();
    }

    @Get("tags")
    @ApiOperation({ summary: "Get all unique pipeline tags" })
    async getTags() {
        return this.pipelinesService.getTags();
    }

    @Get(":id")
    @ApiOperation({ summary: "Get pipeline by ID" })
    async findOne(@Param("id") id: string) {
        return this.pipelinesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: "Create a new pipeline" })
    async create(@Body() createData: Partial<Pipeline>, @Request() req: any) {
        return this.pipelinesService.create({
            ...createData,
            createdById: req.user.id,
        });
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update an existing pipeline" })
    async update(
        @Param("id") id: string,
        @Body() updateData: Partial<Pipeline>,
    ) {
        return this.pipelinesService.update(id, updateData);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: "Delete a pipeline" })
    async remove(@Param("id") id: string) {
        return this.pipelinesService.remove(id);
    }

    @Post(":id/duplicate")
    @ApiOperation({ summary: "Duplicate a pipeline" })
    async duplicate(@Param("id") id: string, @Request() req: any) {
        return this.pipelinesService.duplicate(id, req.user.id);
    }

    @Post(":id/execute")
    @ApiOperation({ summary: "Execute a pipeline" })
    async execute(
        @Param("id") id: string,
        @Body() executionData: { inputData?: any[]; parameters?: Record<string, any> },
    ) {
        // Verify pipeline exists
        await this.pipelinesService.findOne(id);

        return this.pipelineRunnerService.execute(
            id,
            executionData.inputData,
        );
    }

    @Post("validate")
    @ApiOperation({ summary: "Validate pipeline configuration" })
    async validate(@Body() pipelineData: Partial<Pipeline>) {
        const pipeline = new Pipeline();
        Object.assign(pipeline, pipelineData);
        return pipeline.validate();
    }
}
