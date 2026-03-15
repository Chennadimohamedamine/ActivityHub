import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from './entities/activity.entity';
import { User } from '../users/entities/user.entity';
import { Keepup } from '../keepups/entities/keepup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { KeepupsService } from '../keepups/keepups.service';
import { ChatService } from '../chat/chat.service';
import { Category } from './entities/category.entity';
import { SearchActivityDto } from './dto/search-activity.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Keepup) private readonly keepupsRepo: Repository<Keepup>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    private readonly chatService: ChatService,
    private readonly keepupsService: KeepupsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async create(dto: CreateActivityDto, creator: AuthUser, image: string): Promise<{ message: string }> {
    const creatorEntity = await this.userRepo.findOne({ where: { id: creator.sub } });
    if (!creatorEntity) throw new NotFoundException('Creator not found');
    const category = await this.categoryRepo.findOne({ where: { name: dto.categoryName } });
    if (!category) throw new NotFoundException('Category not found');

    const activity = this.activityRepo.create({
      ...dto,
      creator : creatorEntity,
      joinedBy: [creatorEntity],
      image,
      category,
    });

    const followers = await this.keepupsRepo
      .createQueryBuilder('keepups')
      .where('keepups.followingId = :creatorId', { creatorId: creator.sub })
      .select('keepups.followerId', 'id')
      .getRawMany();

    const followerIds = followers.map((f) => f.id);
    const cacheKeysToInvalidate = followerIds.map((id) => `feed_activities_${id}`);
    await Promise.all(cacheKeysToInvalidate.map((key) => this.cacheManager.del(key)));

    await this.cacheManager.del(`user_activities_${creator.sub}`);
    await this.cacheManager.del(`activities:all:${creator.sub}`);

    await this.activityRepo.save(activity);
    await this.chatService.createActivityChat(activity.id,creator.sub ,activity.title, image);
    return { message: "Activity Created Successfully" };
  }

  async getImageProfile(activityId: string): Promise<string> {
    const activity = await this.activityRepo.findOne({
      where: { id: activityId },
      select: ['image'],
    });

    if (!activity) throw new NotFoundException('Activity not found');
    return activity.image;
  }



  async getFeedAct(userId: string): Promise<ActivityResponseDto[]> {

    const cacheKey = `feed_activities_${userId}`;
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const followingIdsRaw = await this.keepupsRepo
      .createQueryBuilder('keepups')
      .leftJoin('keepups.following', 'following')
      .where('keepups.followerId = :userId', { userId })
      .select('following.id', 'id')
      .getRawMany();

    const followingIds = followingIdsRaw.map((f) => f.id);
    if (followingIds.length === 0) return [];

    const feedActivities = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.savedBy', 'savedBy')
      .leftJoinAndSelect('activity.joinedBy', 'joinedBy')
      .leftJoinAndSelect('activity.category', 'category')
      .where('activity."creatorId" IN (:...ids)', { ids: followingIds })
      .orderBy('activity.createdAt', 'DESC')
      .loadRelationCountAndMap('activity.joinedCount', 'activity.joinedBy')
      .limit(20)
      .getMany();

    const now = new Date();
    const mapped: ActivityResponseDto[] = feedActivities.map((act) => ({
      ...act,
      isSaved: act.savedBy?.some((user) => user.id === userId) || false,
      creator: {
        ...plainToInstance(UserResponseDto, act.creator),
        isFollowing: true,
      },
      joinedBy: act.joinedBy?.map((user) => plainToInstance(UserResponseDto, user)) || [],
      isHappened: act.scheduledAt < now,
      isUserJoined: act.joinedBy?.some((user) => user.id === userId) || false,
      categoryName: act.category?.name || 'Uncategorized',
    }));

    const results = plainToInstance(ActivityResponseDto, mapped, {
      excludeExtraneousValues: true,
    });

    const plainResults = JSON.parse(JSON.stringify(results));
    await this.cacheManager.set(cacheKey, plainResults, 60000 * 10);
    return results;
  }

  async getExploreAct(userId: string): Promise<ActivityResponseDto[]> {
    const now = new Date();

    const exploreActivities = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.joinedBy', 'joinedBy')
      .leftJoinAndSelect('activity.savedBy', 'savedBy')
      .leftJoinAndSelect('activity.category', 'category')
      .where('creator.id != :userId', { userId })
      .loadRelationCountAndMap('activity.joinedCount', 'activity.joinedBy')
      .orderBy('RANDOM()')
      .limit(20)
      .getMany();

    const creatorIds = exploreActivities.map((a) => a.creator.id);
    const followingStatuses = await this.keepupsService.getFollowStatuses(userId, creatorIds);
    const mapped = exploreActivities.map((act) => ({
      ...act,
      isHappened: act.scheduledAt < now,
      isSaved: act.savedBy?.some((user) => user.id === userId) || false,
      participantsCount: act.joinedBy?.length || 0,
      creator: {
        ...plainToInstance(UserResponseDto, act.creator),
        isFollowing: followingStatuses[act.creator.id] || false,
      },
      joinedBy: act.joinedBy?.map((user) => plainToInstance(UserResponseDto, user)) || [],
      isUserJoined: act.joinedBy?.some((user) => user.id === userId) || false,
      categoryName: act.category?.name || 'Uncategorized',
    }));

    return plainToInstance(ActivityResponseDto, mapped, {
      excludeExtraneousValues: true,
    });
  }

  async getActivitiesById(currentUser: string, targetUserId: string): Promise<ActivityResponseDto[]> {

    const activities = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.category', 'category')
      .where('activity."creatorId" = :targetUserId', { targetUserId })
      .orderBy('activity.createdAt', 'DESC')
      .loadRelationCountAndMap('activity.joinedCount', 'activity.joinedBy')
      .getMany();

    const now = new Date();
    const mapped: ActivityResponseDto[] = activities.map((act) => ({
      ...act,
      creator: plainToInstance(UserResponseDto, act.creator),
      isHappened: act.scheduledAt < now,
      joinedBy: act.joinedBy?.map((user) => plainToInstance(UserResponseDto, user)) || [],
      isUserJoined: act.joinedBy?.some((user) => user.id === targetUserId) || false,
      isFollowing: this.keepupsService.isFollowing(targetUserId, act.creator.id) || false,
      isSaved: act.savedBy?.some((user) => user.id === targetUserId) || false,
      categoryName: act.category?.name || 'Uncategorized',
      isMine: targetUserId === currentUser,
    }));

  const results = plainToInstance(ActivityResponseDto, mapped, {
  });

    return results;
  }

  async isAlreadyJoined(activityId: string, userId: string): Promise<boolean> {
    const alreadyJoined = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoin('activity.joinedBy', 'user')
      .where('activity.id = :activityId', { activityId })
      .andWhere('user.id = :userId', { userId })
      .getCount();

    return alreadyJoined > 0;
  }

  async joinActivity(activityId: string, user: AuthUser): Promise<{ message: string }> {

    const activityExists = await this.activityRepo.findOne({ where: { id: activityId } });
    if (!activityExists) throw new NotFoundException('Activity not found');

    if (await this.isAlreadyJoined(activityId, user.sub))
      throw new BadRequestException('Already joined');

    await this.activityRepo
      .createQueryBuilder()
      .relation(Activity, 'joinedBy')
      .of(activityId)
      .add(user.sub);

    await this.chatService.joinActivityChat(activityId, user.sub);
    await this.activityRepo.increment({ id: activityId }, 'participantsCount', 1);
    
    await this.cacheManager.del(`activities:all:${user.sub}`);
    await this.cacheManager.del(`user_activities_${user.sub}`);
    await this.cacheManager.del(`feed_activities_${user.sub}`);

    return { message: 'Joined successfully' };
  }

  async leaveActivity(
    activityId: string,
    user: AuthUser,
  ): Promise<{ message: string }> {
    const activityExists = await this.activityRepo.findOne({
      where: { id: activityId },
    });
    if (!activityExists) throw new NotFoundException('Activity not found');

    const isJoined = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoin('activity.joinedBy', 'user')
      .where('activity.id = :activityId', { activityId })
      .andWhere('user.id = :userId', { userId: user.sub })
      .getCount();

    if (isJoined === 0) throw new BadRequestException('You have not joined this activity');

    await this.chatService.leaveActivityChat(activityId, user.sub);
    await this.activityRepo
      .createQueryBuilder()
      .relation(Activity, 'joinedBy')
      .of(activityId)
      .remove(user.sub);
    await this.activityRepo.decrement({ id: activityId }, 'participantsCount', 1);

    await this.cacheManager.del(`activities:all:${user.sub}`);
    await this.cacheManager.del(`user_activities_${user.sub}`);
    await this.cacheManager.del(`feed_activities_${user.sub}`);

    return { message: 'Left activity successfully' };
  }

  // search
  async searchActivities(query: SearchActivityDto, userId: string) {
    const { q, category, location, sortBy, limit = 20, page = 1 } = query;
    const skip = (page - 1) * limit;

    const isDefaultSearch = !q && (!category || category === 'all') && !location && !sortBy;
    const cacheKey = `activities:all:${userId}`;
    if (isDefaultSearch) {
      const cached = await this.cacheManager.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const queryB = this.activityRepo
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.category', 'category')
      .where('creator.id != :userId', { userId });

    if (q?.trim()) queryB.andWhere('activity.title ILIKE :q', { q: `%${q}%` });
    if (location?.trim()) queryB.andWhere('activity.location ILIKE :loc', { loc: `%${location}%` });
    if (category && category !== 'all') queryB.andWhere('category.name = :category', { category });

    if (sortBy === 'most_joined') {
      queryB.orderBy('activity.participantsCount', 'DESC');
    } else if (sortBy === 'least_joined') {
      queryB.orderBy('activity.participantsCount', 'ASC');
    } else if (sortBy === 'soonest') {
      queryB.orderBy('activity.scheduledAt', 'ASC');
    } else {
      queryB.orderBy('activity.createdAt', 'DESC');
    }

    const [activities, total] = await queryB.skip(skip).take(limit).getManyAndCount();
    if (activities.length === 0) return { data: [], total, page, limit };

    const activityIds = activities.map((a) => a.id);

    const joinedStatus = await this.activityRepo
      .createQueryBuilder('activity')
      .innerJoin('activity.joinedBy', 'user', 'user.id = :userId', { userId })
      .where('activity.id IN (:...activityIds)', { activityIds })
      .select('activity.id')
      .getMany();

    const savedStatus = await this.activityRepo
      .createQueryBuilder('activity')
      .innerJoin('activity.savedBy', 'user', 'user.id = :userId', { userId })
      .where('activity.id IN (:...activityIds)', { activityIds })
      .select('activity.id')
      .getMany();

    const joinedSet = new Set(joinedStatus.map((a) => a.id));
    const savedSet = new Set(savedStatus.map((a) => a.id));

    const now = new Date();
    const creatorIds = activities.map((a) => a.creator.id);
    const followingStatuses = await this.keepupsService.getFollowStatuses(userId, creatorIds);

    const mapped = activities.map((act) => ({
      ...act,
      isUserJoined: joinedSet.has(act.id),
      isSaved: savedSet.has(act.id),
      isHappened: act.scheduledAt <= now,
      creator: {
        ...plainToInstance(UserResponseDto, act.creator),
        isFollowing: followingStatuses[act.creator.id] || false,
      },
      categoryName: act.category?.name || 'Uncategorized',
    }));

    const results =  {
      data: plainToInstance(ActivityResponseDto, mapped, { excludeExtraneousValues: true }),
      total,
      page,
      limit,
    };

  if (isDefaultSearch) {
    await this.cacheManager.set(cacheKey, results, 6000 * 10);
  }
    return results;
  }
}