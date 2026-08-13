import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../common/enums/role.enum';
import { GetUsersQueryDto, UpdateUserDto, AdminUpdateUserDto } from './dto/user.dto';

// ─── Multer Storage Config ───────────
const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype === 'application/pdf' ? 'uploads/files' : 'uploads/images';
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ─── Admin Routes ──────────
  @Get('all-users')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: '[Admin] List all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users fetched successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Requires ADMIN role' })
  getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(query);
  }

  @Get('all-admins')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiQuery({ name: 'page', required: false })
  @ApiOperation({ summary: '[Admin] List all admin accounts' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Admins fetched successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Requires ADMIN role' })
  getAllAdmins(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllAdmins(query);
  }

  // ─── Own Profile ───────────────
  @Get('me')
  @ApiOperation({ summary: 'Get the logged-in user\'s profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile fetched successfully' })
  getProfile(@CurrentUser('_id') userId: string) {
    return this.userService.getUserById(userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update the logged-in user\'s profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile updated successfully' })
  updateProfile(
    @CurrentUser('_id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete the logged-in user\'s own account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account deleted' })
  deleteAccount(@CurrentUser('_id') userId: string) {
    return this.userService.deleteUser(userId);
  }

  // ─── Single Avatar ──────────────
  @Post('upload-avatar')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }], {
      storage: multerStorage,
    }),
  )
  @ApiOperation({ summary: 'Upload a profile avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { profileImage: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Profile image is required' })
  createAvatar(
    @CurrentUser('_id') userId: string,
    @UploadedFiles() files: { profileImage?: Express.Multer.File[] },
  ) {
    if (!files?.profileImage?.length) {
      throw new BadRequestException('Profile image is required');
    }
    return this.userService.createAvatar(userId, files as any);
  }

  @Put('upload-avatar')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }], {
      storage: multerStorage,
    }),
  )
  @ApiOperation({ summary: 'Replace the current avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { profileImage: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Avatar updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Profile image is required' })
  updateAvatar(
    @CurrentUser('_id') userId: string,
    @UploadedFiles() files: { profileImage?: Express.Multer.File[] },
  ) {
    if (!files?.profileImage?.length) {
      throw new BadRequestException('Profile image is required');
    }
    return this.userService.updateAvatar(userId, files as any);
  }

  @Delete('upload-avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete the current avatar image' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Avatar deleted successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'No profile image to delete' })
  deleteAvatar(@CurrentUser('_id') userId: string) {
    return this.userService.deleteAvatar(userId);
  }

  // ─── Multiple Avatar ───────────────
  @Post('upload-multiple-avatar')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'multiProfileImage', maxCount: 5 }], {
      storage: multerStorage,
    }),
  )
  @ApiOperation({ summary: 'Upload multiple avatar images (max 5)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        multiProfileImage: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Multiple avatars uploaded successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'At least one avatar image is required' })
  createMultipleAvatars(
    @CurrentUser('_id') userId: string,
    @UploadedFiles() files: { multiProfileImage?: Express.Multer.File[] },
  ) {
    if (!files?.multiProfileImage?.length) {
      throw new BadRequestException('At least one avatar image is required');
    }
    return this.userService.createMultipleAvatars(userId, files as any);
  }

  @Put('upload-multiple-avatar')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'multiProfileImage', maxCount: 5 }], {
      storage: multerStorage,
    }),
  )
  @ApiOperation({ summary: 'Replace multiple avatar images (max 5)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        multiProfileImage: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Multiple avatars updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'At least one avatar image is required' })
  updateMultipleAvatars(
    @CurrentUser('_id') userId: string,
    @UploadedFiles() files: { multiProfileImage?: Express.Multer.File[] },
  ) {
    if (!files?.multiProfileImage?.length) {
      throw new BadRequestException('At least one avatar image is required');
    }
    return this.userService.updateMultipleAvatars(userId, files as any);
  }

  @Delete('upload-multiple-avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all multi-avatar images' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Multiple avatars deleted successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'No profile images to delete' })
  deleteMultipleAvatars(@CurrentUser('_id') userId: string) {
    return this.userService.deleteMultipleAvatars(userId);
  }

  // ─── PDF File ───────────────────
  @Post('upload-file')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'userPDF', maxCount: 1 }], {
      storage: multerStorage,
    }),
  )
  @ApiOperation({ summary: 'Upload a PDF document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { userPDF: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'PDF uploaded successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'PDF file is required' })
  createPDF(
    @CurrentUser('_id') userId: string,
    @UploadedFiles() files: { userPDF?: Express.Multer.File[] },
  ) {
    if (!files?.userPDF?.length) {
      throw new BadRequestException('PDF file is required');
    }
    return this.userService.createPDF(userId, files as any);
  }

  @Put('upload-file')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'userPDF', maxCount: 1 }], {
      storage: multerStorage,
    }),
  )
  @ApiOperation({ summary: 'Replace the current PDF document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { userPDF: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'PDF updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'PDF file is required' })
  updatePDF(
    @CurrentUser('_id') userId: string,
    @UploadedFiles() files: { userPDF?: Express.Multer.File[] },
  ) {
    if (!files?.userPDF?.length) {
      throw new BadRequestException('PDF file is required');
    }
    return this.userService.updatePDF(userId, files as any);
  }

  @Delete('upload-file')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete the current PDF document' })
  @ApiResponse({ status: HttpStatus.OK, description: 'PDF deleted successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'No PDF file to delete' })
  deletePDF(@CurrentUser('_id') userId: string) {
    return this.userService.deletePDF(userId);
  }

  // ─── Admin CRUD (parameterized — MUST be last) ────────
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: '[Admin] Get any user by ID' })
  @ApiParam({ name: 'id', description: 'Mongo ObjectId of the user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User fetched successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  adminGetUser(@Param('id') id: string) {
    return this.userService.adminGetUserById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: '[Admin] Update any user by ID (role, verification, subscription, profile fields)' })
  @ApiParam({ name: 'id', description: 'Mongo ObjectId of the user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  adminUpdateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.userService.adminUpdateUser(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete any user by ID' })
  @ApiParam({ name: 'id', description: 'Mongo ObjectId of the user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  adminDeleteUser(@Param('id') id: string) {
    return this.userService.adminDeleteUser(id);
  }
}
