import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  Firstname: string;

  @Expose()
  Lastname: string;

  @Expose()
  Username: string;

  @Expose()
  profileImage: string;

  @Expose()
  email: string;

  @Expose()
  isFollowing: boolean;
}
