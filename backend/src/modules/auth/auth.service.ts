/**
 * Authentication Service
 *
 * Handles all authentication-related business logic including
 * user registration, login, token generation, and password management.
 */

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { User, UserRole } from "../../entities/user.entity";
import { RegisterDto } from "../../dto/auth/register.dto";
import { ChangePasswordDto } from "../../dto/auth/change-password.dto";
import { JwtPayload } from "../../interfaces/auth/jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  /**
   * Registers a new user account
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; tokens: any }> {
    const { email, password, firstName, lastName, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Create new user
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      password, // Will be hashed by User entity hook
      firstName,
      lastName,
      role: role || UserRole.VIEWER,
    });

    // Save user to database
    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    // Remove password from response
    delete savedUser.password;

    return { user: savedUser, tokens };
  }

  /**
   * Authenticates user with email and password
   */
  async login(
    email: string,
    password: string,
    ip?: string,
  ): Promise<{ user: User; tokens: any }> {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
        select: [
          "id",
          "email",
          "firstName",
          "lastName",
          "password",
          "role",
          "status",
          "lastLoginAt",
          "lastLoginIp",
          "preferences",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException("Account is deactivated");
      }

      // Update last login information
      const loginDate = new Date();
      await this.userRepository.update(user.id, {
        lastLoginAt: loginDate,
        lastLoginIp: ip,
      });

      // Update local object for response
      user.lastLoginAt = loginDate;
      if (ip) user.lastLoginIp = ip;

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Remove password from response
      delete user.password;

      return { user, tokens };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error("Login Error:", error.message);
      throw new UnauthorizedException("Authentication failed");
    }
  }

  /**
   * Changes user password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Validate current password
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException("New passwords do not match");
    }

    // Check if new password is different from current
    const isSamePassword = await user.validatePassword(newPassword);
    if (isSamePassword) {
      throw new BadRequestException(
        "New password must be different from current password",
      );
    }

    // Update password (will be hashed by entity hook)
    user.password = newPassword;
    await this.userRepository.save(user);
  }

  /**
   * Generates new access and refresh tokens for user
   */
  async refreshTokens(refreshToken: string): Promise<any> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("jwt.refreshSecret"),
      }) as JwtPayload;

      // Ensure it's a refresh token
      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid token type");
      }

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("User not found or inactive");
      }

      // Generate new tokens
      return await this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Validates JWT token and returns user information
   */
  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("User not found or inactive");
      }

      delete user.password;
      return user;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  /**
   * Generates access and refresh tokens for user
   */
  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "refresh",
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get("jwt.refreshSecret"),
        expiresIn: this.configService.get("jwt.refreshExpiresIn") || "7d",
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };
  }

  /**
   * Validates user credentials for Passport local strategy
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user || !user.isActive) {
        return null;
      }

      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return null;
      }

      // Remove password from user object
      delete user.password;
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validates user by ID for Passport JWT strategy
   */
  async validateUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.isActive) {
        return null;
      }

      // Remove password from user object
      delete user.password;
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Revokes all refresh tokens for user (logout from all devices)
   */
  async revokeTokens(userId: string): Promise<void> {
    // In a more complex implementation, you might store refresh tokens
    // in Redis or database and revoke them here
    // For now, this is a placeholder for future implementation
    console.log(`Revoking tokens for user ${userId}`);
  }
}
