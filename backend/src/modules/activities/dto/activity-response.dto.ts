import { Expose, Transform, Type } from 'class-transformer';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';

export class ActivityResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  image: string;
  
  @Expose()
  @Transform(({ value }) => value.toLowerCase())
  categoryName: string;

  @Expose()
  scheduledAt: Date;

  @Expose()
  location: string;

  @Expose()
  participantsLimit: number;

  @Expose()
  participantsCount?: number;

  @Expose()
  isUserJoined?: boolean;

  @Expose()
  isSaved: boolean;

  @Expose()
  isHappened: boolean;

  @Expose()
  @Type(() => UserResponseDto)
  creator: UserResponseDto;

  // @Expose()
  // @Type(() => UserResponseDto)
  // savedBy: UserResponseDto[];

  @Expose()   
  @Type(() => UserResponseDto)
  joinedBy: UserResponseDto[];

}

