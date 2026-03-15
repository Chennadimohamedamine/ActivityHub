import {
  Entity,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {

  @Index()
  @Column()
  hashedToken: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  user: User;

}
