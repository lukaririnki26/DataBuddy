
import { IsEmail, IsEnum, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../entities/user.entity';

export class CreateUserDto {
    @ApiProperty({ example: 'newuser@databuddy.com', description: 'User email' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;

    @ApiProperty({ example: 'John', description: 'First name' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'securePassword123!', description: 'Initial password' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @ApiProperty({ enum: UserRole, example: UserRole.VIEWER, description: 'User role' })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'User status' })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}
