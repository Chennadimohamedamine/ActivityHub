import { Notification } from '../entities/notification.entity';

export class NotificationResponseDto {
  id: string;
  recipientId: string;
  senderId: string | null;
  type: string;
  title: string;
  message: string;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: Date;

  constructor(notification: Notification) {
    this.id = notification.id;
    this.recipientId = notification.recipientId;
    this.senderId = notification.senderId ?? null;
    this.type = notification.type;
    this.title = notification.title;
    this.message = notification.message;
    this.relatedEntityId = notification.relatedEntityId ?? null;
    this.isRead = notification.isRead;
    this.createdAt = notification.createdAt;
  }
}

export class PaginatedNotificationsDto {
  data: NotificationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(
    notifications: Notification[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = notifications.map((n) => new NotificationResponseDto(n));
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}