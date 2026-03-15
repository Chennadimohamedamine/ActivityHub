import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Activity } from 'src/modules/activities/entities/activity.entity';
import { plainToInstance } from 'class-transformer';
import { ActivityResponseDto } from 'src/modules/activities/dto/activity-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { KeepupsService } from 'src/modules/keepups/keepups.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import type { Cache } from 'cache-manager';

@Injectable()
export class UserSavedActivitiesService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    private readonly keepupsService: KeepupsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUserSavedActivities(user: AuthUser): Promise<ActivityResponseDto[]> {
    const now = new Date();

    const savedActivities = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.joinedBy', 'joinedBy')
      .leftJoinAndSelect('activity.savedBy', 'savedBy')
      .leftJoinAndSelect('activity.category', 'category')
      .innerJoin('activity.savedBy', 'savedUser', 'savedUser.id = :userId', {
        userId: user.sub,
      })
      .loadRelationCountAndMap('activity.joinedCount', 'activity.joinedBy')
      .orderBy('activity.createdAt', 'DESC')
      .getMany();

    const creatorIds = savedActivities.map((a) => a.creator.id);

    const followingStatuses = await this.keepupsService.getFollowStatuses(
      user.sub,
      creatorIds,
    );

    const mapped = savedActivities.map((act) => ({
      ...act,
      isSaved: true,
      isHappened: act.scheduledAt < now,
      participantsCount: act.joinedBy?.length - 1 || 0,
      isUserJoined:
        act.joinedBy?.some((joined) => joined.id === user.sub) || false,
      creator: {
        ...plainToInstance(UserResponseDto, act.creator),
        isFollowing: followingStatuses[act.creator.id] || false,
      },
      categoryName: act.category?.name || 'Uncategorized',
    }));


    return plainToInstance(ActivityResponseDto, mapped, {
      excludeExtraneousValues: true,
    });
  }

  async saveActivity(activityId: string, user: AuthUser) {
    const activityExists = await this.activityRepo.exists({
      where: { id: activityId },
    });

    if (!activityExists) {
      throw new NotFoundException('Unavailable Activity!');
    }

    const alreadySaved = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.savedActivities', 'activity')
      .where('user.id = :userId', { userId: user.sub })
      .andWhere('activity.id = :activityId', { activityId })
      .getOne();

    if (alreadySaved) {
      throw new BadRequestException('Activity already saved!');
    }

    await this.cacheManager.del(`activities:all:${user.sub}`);
    await this.cacheManager.del(`user_activities_${user.sub}`);
    await this.cacheManager.del(`feed_activities_${user.sub}`);

    await this.userRepo
      .createQueryBuilder()
      .relation(User, 'savedActivities')
      .of(user.sub)
      .add(activityId);

    return { message: 'Activity saved successfully' };
  }

  async unsaveActivity(activityId: string, user: AuthUser) {
    const activityExists = await this.activityRepo.exists({
      where: { id: activityId },
    });

    if (!activityExists) {
      throw new NotFoundException('Unavailable Activity!');
    }

    const alreadySaved = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.savedActivities', 'activity')
      .where('user.id = :userId', { userId: user.sub })
      .andWhere('activity.id = :activityId', { activityId })
      .getOne();

    if (!alreadySaved) {
      throw new NotFoundException('Activity not saved by user!');
    }
    await this.cacheManager.del(`activities:all:${user.sub}`);
    await this.cacheManager.del(`user_activities_${user.sub}`);
    await this.cacheManager.del(`feed_activities_${user.sub}`);

    await this.userRepo
      .createQueryBuilder()
      .relation(User, 'savedActivities')
      .of(user.sub)
      .remove(activityId);

    return { message: 'Activity unsaved successfully' };
  }
}
