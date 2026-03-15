import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Req,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { UserSavedActivitiesService } from './user-saved-activities/user-saved-activities.service';
import { SearchActivityDto } from './dto/search-activity.dto';
import sharp from 'sharp';
import { join } from 'path';
import type { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Controller('activities')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly savedActivService: UserSavedActivitiesService,
  ) {}

  @Get('search')
  search(@Query() query: SearchActivityDto, @CurrentUser() user: AuthUser) {
    return this.activityService.searchActivities(query, user.sub);
  }

  @Get('feed')
  getFeed(@CurrentUser() user: AuthUser) {
    return this.activityService.getFeedAct(user.sub);
  }

  @Get('explore')
  async getExplore(@CurrentUser() user: AuthUser) {
    const activities = await this.activityService.getExploreAct(user.sub);
    return activities;
  }

  //  saving activities
  @Get('save-activities')
  savedActivities(@CurrentUser() user: AuthUser) {
    return this.savedActivService.getUserSavedActivities(user);
  }

  @Post('save-activities/save/:id')
  saveActivity(
    @Param('id', new ParseUUIDPipe()) activityId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.savedActivService.saveActivity(activityId, user);
  }

  @Delete('save-activities/unsave/:id')
  unsaveActivity(
    @Param('id', new ParseUUIDPipe()) activityId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.savedActivService.unsaveActivity(activityId, user);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateActivityDto,
    @Req() req: any,
  ) {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const uploadPath = join(process.cwd(), 'uploads', filename);

    await sharp(file.buffer)
      .resize(800) 
      .webp({ quality: 80 })
      .toFile(uploadPath);

    const creator = req.user;
    return this.activityService.create(dto, creator, filename);
  }

  // @Post()
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, cb) => {
  //         const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         cb(null, uniqueName + extname(file.originalname));
  //       },
  //     }),
  //   }),
  // )
  // async create(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() dto: CreateActivityDto,
  //   @Req() req: any,
  // ) {
  //   const creator = req.user;
  //   return this.activityService.create(dto, creator, file?.filename);
  // }

  @Post(':id/join')
  join(
    @Param('id', new ParseUUIDPipe()) activityId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.activityService.joinActivity(activityId, user);
  }

  @Delete(':id/join')
  leave(
    @Param('id', new ParseUUIDPipe()) activityId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.activityService.leaveActivity(activityId, user);
  }

  @Get(':id/imageProfile')
  getImageProfile(@Param('id', new ParseUUIDPipe()) activityId: string) {
    return this.activityService.getImageProfile(activityId);
  }
  
  @Get('created-activities/:id')
  getCreatedActivities(@Param('id', new ParseUUIDPipe()) targetUserId: string, @CurrentUser() currentUser: AuthUser) {
	  return this.activityService.getActivitiesById(currentUser.sub, targetUserId);
	}

}
