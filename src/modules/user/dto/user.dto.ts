import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jishad Islam' })
  @IsOptional() @IsString() name?: string;

  @ApiPropertyOptional({ example: 'jishad_dev' })
  @IsOptional() @IsString() username?: string;

  @ApiPropertyOptional({ example: '1998-05-20', description: 'ISO date string' })
  @IsOptional() @IsDateString() dob?: string;

  @ApiPropertyOptional({ example: '+8801700000000' })
  @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'], example: 'male' })
  @IsOptional() @IsEnum(['male', 'female', 'other']) gender?: string;

  @ApiPropertyOptional({ example: 'Backend developer.' })
  @IsOptional() @IsString() bio?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional() @IsString() language?: string;

  @ApiPropertyOptional({ example: 'Bangladesh' })
  @IsOptional() @IsString() country?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsOptional() @IsString() cityState?: string;

  @ApiPropertyOptional({ example: 'Road 12, Block C' })
  @IsOptional() @IsString() roadArea?: string;

  @ApiPropertyOptional({ example: '1207' })
  @IsOptional() @IsString() postalCode?: string;

  @ApiPropertyOptional({ example: 'TAX-12345' })
  @IsOptional() @IsString() taxId?: string;
}

export class GetUsersQueryDto {
  @ApiPropertyOptional({ example: '1', description: 'Page number (1-indexed)' })
  @IsOptional() @IsString() page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional() @IsString() limit?: string;

  @ApiPropertyOptional({ example: 'jishad', description: 'Matches against name' })
  @IsOptional() @IsString() search?: string;

  @ApiPropertyOptional({ example: '2026-07-01', description: 'Filter by createdAt date' })
  @IsOptional() @IsString() date?: string;
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiPropertyOptional({ enum: ['USER', 'ADMIN'], example: 'USER' })
  @IsOptional() @IsEnum(['USER', 'ADMIN']) role?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasActiveSubscription?: boolean;
}
