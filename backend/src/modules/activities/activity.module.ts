import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Keepup } from '../keepups/entities/keepup.entity';
import { ChatModule } from '../chat/chat.module';
import { KeepupsService } from '../keepups/keepups.service';
import { UserSavedActivitiesService } from './user-saved-activities/user-saved-activities.service';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Keepup, User, Category]) , ChatModule, NotificationModule],
  controllers: [ActivityController],
  providers: [ActivityService, KeepupsService, UserSavedActivitiesService],
})
export class ActivityModule {}
