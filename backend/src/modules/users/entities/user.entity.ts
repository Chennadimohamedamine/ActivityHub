import { ChatParticipant } from 'src/modules/chat/entities/chat-participant.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

// import { Activity } from './activity.entity';
// import { Notification } from './notification.entity';
// import { Keeper } from './keeper.entity';
// import { KeepingUp } from './keeping-up.entity';
// import { Chat } from './chat.entity';
// import { SavedActivity } from './saved-activity.entity';
// import { Join } from './join.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from 'src/modules/chat/entities/message.entity';
import { MessageRead } from 'src/modules/chat/entities/message-read.entity';
import { Activity } from 'src/modules/activities/entities/activity.entity';
import { Keepup } from 'src/modules/keepups/entities/keepup.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
@Entity('users')
export class User extends BaseEntity {
  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ nullable: true, unique: true })
  Username: string;

  @Column({ nullable: true })
  Firstname: string;

  @Column({ nullable: true })
  Lastname: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @OneToMany(() => ChatParticipant, (participant) => participant.user)
  chatParticipants: ChatParticipant[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => MessageRead, (read) => read.user)
  messageReads: MessageRead[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: '/uploads/default-pfp.jpg' })
  profileImage: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;


  // Relations

  // user own activities
  @OneToMany(() => Activity, activity => activity.creator)
  activities: Activity[];
  
  // user saved activities
  @ManyToMany(() => Activity, (activity) => activity.savedBy)
  @JoinTable({
    name: 'users_saved_activities'
  })
  savedActivities: Activity[]

  // user joined activities
  @ManyToMany(() => Activity, (activity) => activity.joinedBy)
  joinedActivities: Activity[]
  
  // user followings
  @OneToMany(() => Keepup, (keepup) => keepup.follower)
  followings: Keepup[];

  // user followers
  @OneToMany(() => Keepup, (keepup) => keepup.following)
  followers: Keepup[];
  

  // // Activities created by user
  // @OneToMany(() => Activity, activity => activity.creator)
  // activitiesCreated: Activity[];

  // // Activities joined
  // @ManyToMany(() => Activity)
  // @JoinTable()
  // activitiesJoined: Activity[];

  // // Saved activities
  // @OneToMany(() => SavedActivity, saved => saved.user)
  // savedActivities: SavedActivity[];

  // // Notifications received
  // @OneToMany(() => Notification, notification => notification.user)
  // notifications: Notification[];

  // // Keeping up (users this user follows)
  // @OneToMany(() => KeepingUp, keepingUp => keepingUp.user)
  // keepingUp: KeepingUp[];

  // // Followers (users who follow this user)
  // @OneToMany(() => KeepingUp, keepingUp => keepingUp.targetUser)
  // followedByKeepingUp: KeepingUp[];

  // // Keeper relationships
  // @OneToMany(() => Keeper, keeper => keeper.user)
  // keepers: Keeper[];

  // @OneToMany(() => Keeper, keeper => keeper.keeperUser)
  // keptBy: Keeper[];

  // // Chats sent/received
  // @OneToMany(() => Chat, chat => chat.sender)
  // sentChats: Chat[];

  // @OneToMany(() => Chat, chat => chat.activity)
  // receivedChats: Chat[];
}
