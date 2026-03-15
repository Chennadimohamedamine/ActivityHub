import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Keepup } from './entities/keepup.entity';
import { User } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class KeepupsService {
  constructor(
    @InjectRepository(Keepup) private readonly keepupRepo: Repository<Keepup>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly notificationService: NotificationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async followUser(toFollowId: string, followerId: string): Promise<{ message: string }> {
    await this.cacheManager.del(`activities:all:${followerId}`);
    await this.cacheManager.del(`user_activities_${followerId}`);
    await this.cacheManager.del(`feed_activities_${followerId}`);

    if (toFollowId === followerId) {
      throw new BadRequestException("You can't Keep up yourself");
    }

    const target = await this.userRepo.findOne({ 
      where: { id: toFollowId } 
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    const follower = await this.userRepo.findOne({ 
      where: { id: followerId } 
    });

    if (!follower) {
      throw new NotFoundException('User not found');
    }

    const existingFollow = await this.keepupRepo.findOne({
      where: { follower: { id: followerId }, following: { id: toFollowId } },
    });

    if (existingFollow) {
      throw new BadRequestException('Already keeping up this user');
    }

    const keepup = this.keepupRepo.create({ follower, following: target });
    await this.keepupRepo.save(keepup);


    await this.notificationService.createNotification({
      recipientId: target.id,
      senderId: follower.id,
      type: NotificationType.FOLLOW,
      title: 'New keep up',
      message: `${follower.Username} keeped up with you!`,
      relatedEntityId: null,
    });

    return { message: 'Keeped up successfully' };
  }


  async unfollowUser(toUnfollowId: string, followerId: string): Promise<{ message: string }> {
    await this.cacheManager.del(`activities:all:${followerId}`);
    await this.cacheManager.del(`user_activities_${followerId}`);
    await this.cacheManager.del(`feed_activities_${followerId}`);

    if (toUnfollowId === followerId)
      throw new BadRequestException("You can't unkeep up yourself");

    const keepup = await this.keepupRepo.findOne({
      where: { follower: { id: followerId }, following: { id: toUnfollowId } },
    });

    if (!keepup) 
      throw new NotFoundException('You are not a keeper to this user');

    await this.keepupRepo.remove(keepup);
    return { message: 'Unkeeped up successfully' };
  }

  async followers(userId: string): Promise<UserResponseDto[]> {
    const keepers = await this.keepupRepo.find({
      where: { following: { id: userId } },
      relations: ['follower'],
    });

    const followersOnly = keepers.map(k => k.follower);
    return plainToInstance(UserResponseDto, followersOnly, 
      { excludeExtraneousValues: true });
  }

  async following(userId: string): Promise<UserResponseDto[]> {
    const keepingUp = await this.keepupRepo.find({
      where: { follower: { id: userId } },
      relations: ['following'],
    });

    const followingsOnly = keepingUp.map(k => k.following);
    return plainToInstance(UserResponseDto, followingsOnly, {
      excludeExtraneousValues: true });
  }

  async followersCount(userId: string): Promise<number> {
    return this.keepupRepo.count({ 
      where: { following: { id: userId } } });
  }

  async followingCount(userId: string): Promise<number> {
    return this.keepupRepo.count({ 
      where: { follower: { id: userId } } 
    });
  }

  async isFollowing(followerId: string, targetId: string): Promise<boolean> {
    const count = await this.keepupRepo.count({
      where: { follower: { id: followerId }, following: { id: targetId } },
    });
    return count > 0;
  }
  
  async getFollowStatuses(followerId: string, creatorIds: string[]): Promise<Record<string, boolean>> {
    if (creatorIds.length === 0) 
      return { };

    const follows = await this.keepupRepo.find({
      where: {
        follower: { id: followerId },
        following: { id: In(creatorIds) },
      },
      relations: ['following'],
    });

    const mappingFollowing: Record<string, boolean> = {};
    creatorIds.forEach(id => {
      mappingFollowing[id] = follows.some(f => f.following.id === id);
    });

    return mappingFollowing;
  }
}
