import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Activity } from 'src/modules/activities/entities/activity.entity';
import { plainToInstance } from 'class-transformer';
import { ActivityResponseDto } from 'src/modules/activities/dto/activity-response.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserSavedActivitiesService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>
    ) { }

    async getUserSavedActivities(user: User) {
      const userAndSavAct = await this.userRepo.findOne({
        where: { id: user.id },
        relations: ['savedActivities', 'savedActivities.creator'],
      });

      if (!userAndSavAct) {
        throw new NotFoundException('User not found');
      }

      // Add isSaved property
      const activitiesWithIsSaved = userAndSavAct.savedActivities.map(act => ({
        ...act,
        isSaved: true,
      }));

      return plainToInstance(
        ActivityResponseDto,
        activitiesWithIsSaved,
        { excludeExtraneousValues: true }
      );
  }

  async saveActivity(activityId: string, user: User) {

    const activityExists = await this.activityRepo.exists({
      where: { id: activityId },
    });

    if (!activityExists) {
      throw new NotFoundException('Unavailable Activity!');
    }

    const alreadySaved = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.savedActivities', 'activity')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('activity.id = :activityId', { activityId })
      .getOne();

    if (alreadySaved) {
      throw new BadRequestException('Activity already saved!');
    }

    await this.userRepo
      .createQueryBuilder()
      .relation(User, 'savedActivities')
      .of(user.id)
      .add(activityId);

    return { message: 'Activity saved successfully' };
  }

  async unsaveActivity(activityId: string, user: User) {
    const activityExists = await this.activityRepo.exists({
      where: { id: activityId },
    });

    if (!activityExists) {
      throw new NotFoundException('Unavailable Activity!');
    }

    const alreadySaved = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.savedActivities', 'activity')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('activity.id = :activityId', { activityId })
      .getOne();

    if (!alreadySaved) {
      throw new NotFoundException('Activity not saved by user!');
    }

    await this.userRepo
      .createQueryBuilder()
      .relation(User, 'savedActivities')
      .of(user.id)
      .remove(activityId);

    return { message: 'Activity unsaved successfully' };
  }
}
