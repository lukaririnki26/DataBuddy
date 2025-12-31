/**
 * Change Password DTO
 *
 * Data Transfer Object for password change requests.
 * Requires current password for security verification.
 */

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'currentpassword123',
  })
  @IsString({ message: 'Current password must be a string' })
  @MinLength(1, { message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newpassword123',
    minLength: 8,
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'newpassword123',
  })
  @IsString({ message: 'Password confirmation must be a string' })
  @MinLength(1, { message: 'Password confirmation is required' })
  confirmPassword: string;
}
