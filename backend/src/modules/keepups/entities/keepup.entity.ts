import { User } from "src/modules/users/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('keepups')
@Unique(['follower', 'following'])
export class Keepup {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.followings)
    follower: User;

    @ManyToOne(() => User, (user) => user.followers)
    following: User;
}
