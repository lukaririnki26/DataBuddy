/**
 * Authentication Module
 *
 * Module that handles all authentication-related functionality
 * including user registration, login, JWT tokens, and authorization.
 */

import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User } from "../../entities/user.entity";
import { JwtStrategy } from "../../strategies/jwt.strategy";
import { LocalStrategy } from "../../strategies/local.strategy";

@Module({
  imports: [
    // Register Passport with default strategy
    PassportModule.register({ defaultStrategy: "jwt" }),

    // Register User entity for database operations
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtStrategy, LocalStrategy, PassportModule],
})
export class AuthModule { }
