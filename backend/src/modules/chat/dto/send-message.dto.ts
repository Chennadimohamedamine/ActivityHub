import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters' })
  content: string;

  @IsOptional()
  @IsIn(['text', 'image', 'file'])
  messageType?: string;
}