import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UserSavedActivitiesService } from './user-saved-activities/user-saved-activities.service';
import { Activity } from '../activities/entities/activity.entity';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Activity]), ChatModule],
  providers: [UsersService, UserSavedActivitiesService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}