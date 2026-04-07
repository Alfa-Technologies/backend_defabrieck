import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationInput } from './dto/create-notification.input';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(createInput: CreateNotificationInput): Promise<Notification> {
    const newNotification = this.notificationRepository.create(createInput);
    return await this.notificationRepository.save(newNotification);
  }

  async findAllByUser(
    userId: string,
    unreadOnly: boolean = false,
  ): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .orderBy('notification.created_at', 'DESC');

    if (unreadOnly) {
      query.andWhere('notification.is_read = :isRead', { isRead: false });
    }

    return await query.getMany();
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({ id });
    if (!notification)
      throw new NotFoundException(
        `No se encontró la notificación con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return true;
  }
}
