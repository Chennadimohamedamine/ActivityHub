import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationDto } from './dto/pagination.dto';
import {
  PaginatedNotificationsDto,
} from './dto/notification-response.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  // ─── Create ──────────────────────────────────────────────────────────────

  /**
   * Persist a new notification and immediately push it to the recipient
   * via WebSocket.
   */
  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      recipientId: dto.recipientId,
      senderId: dto.senderId ?? null,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      relatedEntityId: dto.relatedEntityId ?? null,
    });

    const saved = await this.notificationRepository.save(notification);

    this.logger.debug(
      `Notification ${saved.id} created for user ${saved.recipientId}`,
    );

    // Fire-and-forget real-time delivery
    this.sendRealTimeNotification(saved);

    return saved;
  }

  // ─── Real-time ───────────────────────────────────────────────────────────

  sendRealTimeNotification(notification: Notification): void {
    this.notificationGateway.sendNotificationToUser(notification);
  }

  // ─── Query ───────────────────────────────────────────────────────────────

  async getUserNotifications(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedNotificationsDto> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { recipientId: userId },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    return new PaginatedNotificationsDto(notifications, total, page, limit);
  }

  // ─── Mark as Read ────────────────────────────────────────────────────────

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with id "${notificationId}" not found`,
      );
    }

    // if (notification.recipientId !== userId) {
    //   throw new ForbiddenException(
    //     'You do not have permission to update this notification',
    //   );
    // }

    if (notification.isRead) {
      return notification; // Already read — nothing to do
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('recipientId = :userId AND isRead = false', { userId })
      .execute();

    const updated = result.affected ?? 0;
    this.logger.debug(`Marked ${updated} notifications as read for user ${userId}`);

    return { updated };
  }
}