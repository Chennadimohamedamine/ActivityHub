import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(15)
  firstName: string;

  @IsString()
  @MaxLength(15)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bio: string;
}