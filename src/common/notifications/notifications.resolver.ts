import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationInput } from './dto/create-notification.input';
import { User } from '../../iam/users/entities/user.entity';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';

@Resolver(() => Notification)
@UseGuards(JwtAuthGuard)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Mutation(() => Notification)
  createNotification(
    @Args('createNotificationInput') createInput: CreateNotificationInput,
  ): Promise<Notification> {
    return this.notificationsService.create(createInput);
  }

  @Query(() => [Notification], { name: 'myNotifications' })
  findAll(
    @CurrentUser() user: User,
    @Args('unreadOnly', { type: () => Boolean, defaultValue: false })
    unreadOnly: boolean,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllByUser(user.id, unreadOnly);
  }

  @Mutation(() => Notification)
  markNotificationAsRead(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Mutation(() => Boolean)
  markAllNotificationsAsRead(@CurrentUser() user: User): Promise<boolean> {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
