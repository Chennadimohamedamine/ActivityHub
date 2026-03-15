import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminUsersQueryDto } from './dto/admin-user-query.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { use } from 'passport';
import { UserSavedActivitiesService } from './user-saved-activities/user-saved-activities.service';
import { log } from 'console';
import { ChatGateway } from 'src/modules/chat/chat.gateway';
import type { AuthUser } from 'src/common/interfaces/auth-user.interface';
import * as fs from 'fs';
import * as path from 'path'

@Controller('users')
export class UsersController {

	constructor(
		private readonly usersService: UsersService,
		private readonly savedActivService: UserSavedActivitiesService,
		private readonly chatGateway: ChatGateway
	) { }
	@Get('search')
	searchUsers(@Query('query') query: string, @CurrentUser() user: AuthUser) {
		return this.usersService.searchUsers(query, user.sub);
	}


	@Get('userinfo')
	getUserInfo(@CurrentUser() user: AuthUser) {
		return this.usersService.findById(user.sub);
	}

	@Get('profile')
	getProfile(@CurrentUser() user: AuthUser) {
		return this.usersService.findById(user.sub);
	}

	@Get(':username') 
	getProfileByUsername(@Param('username') username: string, @CurrentUser() user : AuthUser) {
		return this.usersService.findByUsernameWithoOwnProfile(username, user);
	}

	@Patch('profile')
	async updateProfile(
		@CurrentUser() user: AuthUser,
		@Body() dto: UpdateProfileDto,
	) {
		return this.usersService.updateProfile(user.sub, dto);
	}


	@Post('upload-avatar')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads', // folder where files will be saved
				filename: (req, file, callback) => {
					// use user ID for unique filename
					const user = req.user as AuthUser; // CurrentUser decorator or your auth middleware
					const uniqueSuffix = `${user.sub}${extname(file.originalname)}`;
					callback(null, uniqueSuffix);
				},
			}),
			fileFilter: (req, file, callback) => {
				// only allow images
				if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
					return callback(new Error('Only image files are allowed!'), false);
				}
				callback(null, true);
			},
		}),
	)
	async uploadAvatar(
	@CurrentUser() user: AuthUser,
	@UploadedFile() file: Express.Multer.File,
	) {
		if (!file) throw new Error('No file uploaded');

		const imagePath = `/uploads/${file.filename}`;
	const existingUser = await this.usersService.findById(user.sub);
	const oldExt = path.extname(existingUser.profileImage);
	const newExt = path.extname(file.filename);

	if (existingUser?.profileImage && !existingUser.profileImage.includes('default') && oldExt !== newExt) {
	const oldPath = `.${existingUser.profileImage}`;
	fs.unlink(oldPath, (err) => {
		if (err) console.warn('Could not delete old avatar:', err.message);
	});
	}

		// save path to user in database
		await this.usersService.updateimage(user.sub, imagePath);

		return { profileImage: imagePath };
	}

	@Get('admin/all')
	getAdminUsers(@Query() query: AdminUsersQueryDto) {
		return this.usersService.getAdminUsers(query);
	}

	@Public()
	@Get(':id/online-status')
	getOnlineStatus(@Param('id') id: string) {
		return { userId: id, isOnline: this.chatGateway.isUserOnline(id) };
	}

	// @Get('admin/view/:id')
	// getAdminUser(@Param('id') id: string) {
	//   return this.usersService.getAdminUserById(id);
	// }

	// @Put(':id')
	// updateAdminUser(@Param('id') id: string, @Query() dto: UpdateUserDto) {
	//   return this.usersService.updateAminUser(id, dto);
	// }

	// @Delete(':id')
	// deleteAdminUser(@Param('id') id: string) {
	//   return this.usersService.deleteAdminUser(id);
	// }

}


