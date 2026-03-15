import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
    OneToMany
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Chat } from "src/modules/chat/entities/chat.entity";
import { Category } from "./category.entity";
import { isUUID } from "class-validator";

@Entity("activities")
export class Activity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @ManyToOne(() => Category, (category) => category.activities)
  category: Category;

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column()
  location: string;

  @Column({ type: "int", default: 0 })
  participantsLimit: number;

  @Column({ type: "int", default: 0 })
  participantsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  image: string;

  // creator
  
  @ManyToOne(() => User, (user) => user.activities)
  creator: User


  @ManyToMany(() => User, (user) => user.savedActivities)
  savedBy: User[]
  
  @ManyToMany(() => User, (user) => user.joinedActivities)
  @JoinTable({
    name: 'users_joined_activities'
  })
  joinedBy: User[]

  @OneToMany(() => Chat, (chat) => chat.activity)
  chats: Chat[];
}
