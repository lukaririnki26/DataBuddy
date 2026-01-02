/**
 * User Entity
 *
 * Represents a user in the DataBuddy system with role-based access control.
 * Supports multiple roles: admin, editor, viewer with different permissions.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";
import * as bcrypt from "bcrypt";
import { Pipeline } from "./pipeline.entity";
import { DataImport } from "./data-import.entity";
import { DataExport } from "./data-export.entity";

export enum UserRole {
  ADMIN = "admin", // Full access to all features
  EDITOR = "editor", // Can create/edit pipelines and manage data
  VIEWER = "viewer", // Read-only access to data and monitoring
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 100 })
  @IsEmail()
  email: string;

  @Column({ length: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @Column({ length: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  status: UserStatus;

  @Column({ type: "text", nullable: true })
  avatar?: string;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt?: Date;

  @Column({ type: "varchar", length: 45, nullable: true })
  lastLoginIp?: string;

  @Column({ type: "jsonb", nullable: true })
  preferences?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Pipeline, (pipeline) => pipeline.createdBy)
  pipelines: Pipeline[];

  @OneToMany(() => DataImport, (dataImport) => dataImport.createdBy)
  dataImports: DataImport[];

  @OneToMany(() => DataExport, (dataExport) => dataExport.createdBy)
  dataExports: DataExport[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  get isEditor(): boolean {
    return this.role === UserRole.EDITOR || this.role === UserRole.ADMIN;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  // Password hashing hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith("$2b$")) {
      // Only hash if it's not already a bcrypt hash
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Password validation method
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Permission checking methods
  canCreatePipelines(): boolean {
    return this.isEditor;
  }

  canEditPipelines(): boolean {
    return this.isEditor;
  }

  canDeletePipelines(): boolean {
    return this.isAdmin;
  }

  canImportData(): boolean {
    return this.isEditor;
  }

  canExportData(): boolean {
    return this.isEditor;
  }

  canManageUsers(): boolean {
    return this.isAdmin;
  }

  canViewAllData(): boolean {
    return this.isEditor;
  }

  // Update last login information
  updateLastLogin(ip?: string) {
    this.lastLoginAt = new Date();
    if (ip) {
      this.lastLoginIp = ip;
    }
  }
}
