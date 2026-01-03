import { IsOptional, IsString, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfileDto {
    @ApiProperty({ description: "User first name", required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ description: "User last name", required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ description: "User preferences (notifications, theme, etc)", required: false })
    @IsOptional()
    @IsObject()
    preferences?: Record<string, any>;
}
