/**
 * Register DTO
 *
 * Data Transfer Object for user registration requests.
 * Contains validation rules for all required user fields.
 */

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../../entities/user.entity";

export class RegisterDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    format: "email",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    description: "User password",
    example: "password123",
    minLength: 8,
  })
  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;

  @ApiProperty({
    description: "User first name",
    example: "John",
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: "First name must be a string" })
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  @MaxLength(100, { message: "First name must not exceed 100 characters" })
  firstName: string;

  @ApiProperty({
    description: "User last name",
    example: "Doe",
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: "Last name must be a string" })
  @MinLength(2, { message: "Last name must be at least 2 characters long" })
  @MaxLength(100, { message: "Last name must not exceed 100 characters" })
  lastName: string;

  @ApiPropertyOptional({
    description: "User role (only admins can set this)",
    enum: UserRole,
    example: UserRole.VIEWER,
  })
  @IsOptional()
  role?: UserRole;
}
