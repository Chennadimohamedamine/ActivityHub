import { Controller, Get, Post, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { KeepupsService } from './keepups.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import type { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Controller('keepups')
export class KeepupsController {
  constructor(private readonly keepupsService: KeepupsService) {}

  @Post('follow/:id')
  followUser(@Param('id', new ParseUUIDPipe()) toFollowId: string, @CurrentUser() user: AuthUser) {
    return this.keepupsService.followUser(toFollowId, user.sub);
  }

  @Delete('unfollow/:id')
  unfollowUser(@Param('id', new ParseUUIDPipe()) toUnfollowId: string, @CurrentUser() user: AuthUser) {
    return this.keepupsService.unfollowUser(toUnfollowId, user.sub);
  }

  @Get('followers/:id')
  getFollowers(@Param('id', new ParseUUIDPipe()) userId: string) {
    return this.keepupsService.followers(userId);
  }

  @Get('following/:id')
  getFollowing(@Param('id', new ParseUUIDPipe()) userId: string) {
    return this.keepupsService.following(userId);
  }

  @Get('is-following/:id')
  async isFollowing(@Param('id') targetId: string,@CurrentUser() user: AuthUser) {
    const result = await this.keepupsService.isFollowing(user.sub, targetId);
    return { isFollowing: result };
  }
  
}

