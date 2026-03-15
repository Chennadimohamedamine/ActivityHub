import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PaginationDto } from './dto/pagination.dto';
import {
  NotificationResponseDto,
  PaginatedNotificationsDto,
} from './dto/notification-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/interfaces/auth-user.interface';

/**
 * Adjust the import path for JwtAuthGuard to match your project layout.
 * The guard is expected to attach `request.user.id` (or `request.user.sub`)
 * for the authenticated user.
 */

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * GET /notifications
   * Returns paginated notifications for the authenticated user.
   */
  @Get()
  async getNotifications(
    @CurrentUser() user: AuthUser,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedNotificationsDto> {
    return this.notificationService.getUserNotifications(
      user.sub,
      pagination,
    );
  }

  /**
   * PATCH /notifications/read-all
   * Marks all unread notifications of the authenticated user as read.
   * Must be declared BEFORE /:id/read so Express doesn't treat "read-all" as a UUID.
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(
    @CurrentUser() user: AuthUser,
  ): Promise<{ updated: number }> {
    return this.notificationService.markAllAsRead(user.sub);
  }

  /**
   * PATCH /notifications/:id/read
   * Marks a single notification as read.
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationService.markAsRead(
      id,
      user.sub,
    );
    return new NotificationResponseDto(notification);
  }
}