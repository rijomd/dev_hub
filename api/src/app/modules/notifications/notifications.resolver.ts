import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Args,
  Context,
  Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '../auth/gql-jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationsPubSub, NOTIFICATION_CREATED } from './notifications.pubsub';
import {
  NotificationObject,
  RegisterGitRepositoryInput,
} from './notifications.types';
import { GitRepository } from '../../entities/git-repository.entity';

@Resolver(() => NotificationObject)
export class NotificationsResolver {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pubSub: NotificationsPubSub,
  ) { }

  // ─── Queries ──────────────────────────────────────────────────────────────

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [NotificationObject], {
    description: 'Get recent notifications for the authenticated user.',
  })
  async myNotifications(
    @Context() context: any,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args('onlyUnread', { nullable: true, defaultValue: false }) onlyUnread: boolean,
  ): Promise<NotificationObject[]> {
    const userId: number = context.req.user.userId;
    const rows = await this.notificationsService.getNotificationsForUser(
      userId,
      limit,
      onlyUnread,
    );

    // Map entity to GraphQL object type
    return rows.map((n) => ({
      id: n.id,
      eventType: n.eventType,
      message: n.message,
      metadata: n.metadata as Record<string, unknown>,
      isRead: n.isRead,
      createdAt: n.createdAt,
      readAt: n.readAt,
      projectId: (n.project as any)?.id ?? 0,
      recipient: {
        id: (n.recipient as any)?.id ?? userId,
        name: (n.recipient as any)?.name ?? '',
        email: (n.recipient as any)?.email ?? '',
      },
      actor: n.actor
        ? {
          id: (n.actor as any).id,
          name: (n.actor as any).name ?? '',
          email: (n.actor as any).email ?? '',
        }
        : undefined,
    })) as unknown as NotificationObject[];
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => Int, {
    description: 'Count of unread notifications for the authenticated user.',
  })
  unreadNotificationCount(@Context() context: any): Promise<number> {
    const userId: number = context.req.user.userId;
    return this.notificationsService.countUnread(userId);
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => NotificationObject, {
    description: 'Mark a single notification as read.',
  })
  async markNotificationRead(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: any,
  ): Promise<NotificationObject> {
    const userId: number = context.req.user.userId;
    const n = await this.notificationsService.markAsRead(id, userId);
    return this.mapNotification(n);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Int, {
    description: 'Mark all notifications as read. Returns count of updated rows.',
  })
  markAllNotificationsRead(@Context() context: any): Promise<number> {
    const userId: number = context.req.user.userId;
    return this.notificationsService.markAllAsRead(userId);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => GitRepository, {
    description: 'Register a git repository and link it to a project.',
  })
  registerGitRepository(
    @Args('input') input: RegisterGitRepositoryInput,
  ): Promise<GitRepository> {
    return this.notificationsService.registerGitRepository(input);
  }

  // ─── Subscription ─────────────────────────────────────────────────────────

  /**
   * Subscribes to real-time notifications for the authenticated user.
   *
   * The filter ensures each client only receives events where they
   * are the recipient — not other users' notifications.
   *
   * Client usage:
   *   subscription {
   *     notificationCreated {
   *       id message eventType isRead createdAt
   *       actor { name }
   *     }
   *   }
   *
   * NOTE: The subscription context for graphql-ws carries the JWT
   * in the `connectionParams`. The GqlJwtAuthGuard handles validation.
   */
  @UseGuards(GqlJwtAuthGuard)
  @Subscription(() => NotificationObject, {
    /**
     * Filter: only deliver the event to the user who is the recipient.
     * `payload.recipientId` is set in NotificationsService.handleGitPush.
     * `variables` comes from the client subscription arguments (none here).
     * `context` carries the authenticated user from the WS connection.
     */
    filter(payload: any, _variables: any, context: any) {
      const userId: number = context.req?.user?.userId ?? context.user?.userId;
      return payload.recipientId === userId;
    },
    resolve(payload: any) {
      return payload.notificationCreated;
    },
  })
  notificationCreated() {
    return this.pubSub.asyncIterator(NOTIFICATION_CREATED);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private mapNotification(n: any): NotificationObject {
    return {
      id: n.id,
      eventType: n.eventType,
      message: n.message,
      metadata: n.metadata,
      isRead: n.isRead,
      createdAt: n.createdAt,
      readAt: n.readAt,
      projectId: n.project?.id ?? 0,
      recipient: {
        id: n.recipient?.id ?? 0,
        name: n.recipient?.name ?? '',
        email: n.recipient?.email ?? '',
      },
      actor: n.actor
        ? { id: n.actor.id, name: n.actor.name ?? '', email: n.actor.email ?? '' }
        : undefined,
    } as unknown as NotificationObject;
  }
}
