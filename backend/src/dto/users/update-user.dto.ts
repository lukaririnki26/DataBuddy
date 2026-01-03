
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../entities/user.entity';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John', description: 'First name' })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({ enum: UserRole, description: 'User role' })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ enum: UserStatus, description: 'User status' })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}
