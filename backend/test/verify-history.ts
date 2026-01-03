import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Import from local path since we run from src root context or similar
import { PipelinesService } from './modules/pipelines/pipelines.service';
import { PipelineRunnerService } from './modules/pipelines/pipeline-runner.service';
import { PipelineExecutionsService } from './modules/pipelines/pipeline-executions.service';
import { User } from './entities/user.entity';
import { DataSource } from 'typeorm';
import { StepType } from './types/step-type';

async function verifyHistory() {
    console.log('Starting Pipeline History Verification...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const pipelinesService = app.get(PipelinesService);
    const runnerService = app.get(PipelineRunnerService);
    const executionsService = app.get(PipelineExecutionsService);
    const dataSource = app.get(DataSource);

    try {
        // 1. Get an active user
        const usersRepo = dataSource.getRepository(User);
        const user = await usersRepo.findOne({ where: {} }); // Get any user
        if (!user) {
            console.error('No users found. Please seed data first.');
            return;
        }
        console.log(`Using user: ${user.email} (${user.id})`);

        // 2. Create a test pipeline
        const pipeline = await pipelinesService.create({
            name: 'History Verification Pipeline',
            description: 'Used to verify execution recording',
            isActive: true,
            createdById: user.id, // Use ID or entity depending on implementation
            // Typically createdBy is a relation, create accepts Partial<Pipeline>
            // Let's try passing the user entity as createdBy if that's what's expected typographically,
            // but usually the service might handle relations.
            // Based on Pipeline entity, 'createdBy' is ManyToOne User.
            createdBy: user,
            steps: [
                {
                    name: 'Step 1',
                    type: StepType.CUSTOM_SCRIPT,
                    order: 1,
                    config: { script: 'return input;' }
                }
            ] as any
        });
        console.log(`Created pipeline: ${pipeline.id}`);

        // 3. Execute the pipeline
        console.log('Executing pipeline...');
        const result = await runnerService.execute(pipeline.id, [{ test: 'input' }], user.id);
        console.log('Execution result:', result);

        if (!result.executionId) {
            throw new Error('Execution ID is missing in the result!');
        }

        // 4. Verify Execution Record in DB
        const execution = await executionsService.findOne(result.executionId);
        console.log('Retrieved execution record:', execution);

        if (!execution) {
            throw new Error('Execution record not found in DB!');
        }

        if (execution.status !== 'completed') {
            throw new Error(`Execution status is ${execution.status}, expected completed`);
        }

        // 5. Verify Input/Output Snapshots
        console.log('Input Snapshot:', execution.inputSnapshot);
        console.log('Output Snapshot:', execution.outputSnapshot);

        if (!execution.inputSnapshot || !execution.outputSnapshot) {
            throw new Error('Input or Output snapshot is missing!');
        }

        console.log('VERIFICATION SUCCESSFUL: Pipeline Execution recorded correctly.');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
    } finally {
        await app.close();
    }
}

verifyHistory();
