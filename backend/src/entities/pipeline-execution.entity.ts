import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { User } from './user.entity';

export enum ExecutionStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('pipeline_executions')
@Index(['pipelineId', 'createdAt'])
@Index(['userId', 'createdAt'])
export class PipelineExecution {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    pipelineId: string;

    @ManyToOne(() => Pipeline, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pipelineId' })
    pipeline: Pipeline;

    @Column({ type: 'uuid', nullable: true })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({
        type: 'enum',
        enum: ExecutionStatus,
        default: ExecutionStatus.PENDING,
    })
    status: ExecutionStatus;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({ type: 'int', nullable: true })
    durationMs: number;

    @Column({ type: 'jsonb', nullable: true })
    inputSnapshot: any;

    @Column({ type: 'jsonb', nullable: true })
    outputSnapshot: any;

    @Column({ type: 'jsonb', nullable: true })
    logs: any[];

    @Column({ type: 'text', nullable: true })
    error: string;

    @CreateDateColumn()
    createdAt: Date;
}
