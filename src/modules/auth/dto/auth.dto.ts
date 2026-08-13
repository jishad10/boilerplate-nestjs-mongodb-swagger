import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumberString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Auth DTOs
 * ─────────────────────────────────────────────────────────
 * Replaces the inline DTO interfaces in auth.service.ts.
 * With NestJS + class-validator, these are automatically
 * validated by the global ValidationPipe in main.ts.
 *
 * @ApiProperty() decorators document these fields in Swagger
 * (/api/docs) — they don't affect runtime validation.
 */

export class RegisterDto {
  @ApiProperty({ example: 'Jishad Islam', description: "User's full name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jishad@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'jishad@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token issued at login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgetPasswordDto {
  @ApiProperty({ example: 'jishad@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyCodeDto {
  @ApiProperty({ example: 'jishad@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP sent to email' })
  @IsNumberString()
  @Length(6, 6)
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'jishad@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'NewStrongPass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass123' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'NewStrongPass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
