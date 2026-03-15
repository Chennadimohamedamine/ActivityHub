import { Module } from '@nestjs/common';
import { KeepupsService } from './keepups.service';
import { KeepupsController } from './keepups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keepup } from './entities/keepup.entity';
import { User } from '../users/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Keepup, User]), NotificationModule],
  controllers: [KeepupsController],
  providers: [KeepupsService],
})
export class KeepupsModule {}
