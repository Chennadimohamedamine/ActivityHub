import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatParticipant } from './chat-participant.entity';
import { Message } from './message.entity';
import { Activity } from 'src/modules/activities/entities/activity.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  RoomName: string;

  @Column({ type: 'enum', enum: ['private', 'group'], default: 'private' })
  type: 'private' | 'group';

  @Column({ nullable: true, type: 'varchar', length: 255 })
  name: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  avatar: string;

  @Column({ nullable: true, type: 'uuid' })
  activityId: string;

  @ManyToOne(() => Activity, (activity) => activity.chats, { nullable: true })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ default: false })
  isMuted: boolean;

  @OneToMany(() => ChatParticipant, (p) => p.chat, { cascade: true })
  participants: ChatParticipant[];

  @OneToMany(() => Message, (m) => m.chat, { cascade: true })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}