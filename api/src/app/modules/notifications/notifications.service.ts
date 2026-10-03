import { Injectable, Logger } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsPubSub, NOTIFICATION_CREATED } from './notifications.pubsub';
import { NotificationEventType } from '../../entities/notification.entity';
import { GitProvider } from '../../entities/git-repository.entity';

// ─── Webhook payload shapes ──────────────────────────────────────────────────

export interface GitHubPushPayload {
  /** GitHub's unique repo identifier (numeric, sent as number in the payload). */
  repository: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    pushed_at?: number;
  };
  ref: string;            // e.g. "refs/heads/feature/login"
  before: string;
  after: string;          // latest commit SHA
  commits: Array<{
    id: string;
    message: string;
    author: { name: string; email: string };
  }>;
  pusher: {
    name: string;
    email: string;
  };
  compare: string;        // compare URL
  /** Internal — resolved from JWT / DB lookup after the push arrives. */
  actorUserId?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly pubSub: NotificationsPubSub,
  ) { }

  // ─── GIT_PUSH event ───────────────────────────────────────────────────────

  /**
   * Main entry point called by the GitHub webhook controller.
   *
   * Flow:
   *  1. Resolve the GitRepository → Project → members
   *  2. Exclude the actor (pusher) from recipients
   *  3. Create one Notification row per recipient
   *  4. Publish each to the GraphQL subscription bus
   */
  async handleGitPush(payload: GitHubPushPayload): Promise<void> {
    const externalId = String(payload.repository.id);

    // 1 – Find linked project with members
    const gitRepo = await this.notificationsRepository.findRepoWithProjectAndMembers(
      externalId,
      GitProvider.GITHUB,
    );

    if (!gitRepo) {
      this.logger.warn(
        `GIT_PUSH received for repository "${payload.repository.full_name}" ` +
        `(externalId: ${externalId}) but no active GitRepository record found. Skipping.`,
      );
      return;
    }

    const project = gitRepo.project;
    const members = project.members ?? [];

    if (members.length === 0) {
      this.logger.debug(
        `Project #${project.id} has no members — no notifications created.`,
      );
      return;
    }

    // 2 – Derive branch name from ref (refs/heads/feature/login → feature/login)
    const branch = payload.ref.replace('refs/heads/', '');

    // 3 – Build metadata
    const metadata = {
      repository: payload.repository.full_name,
      branch,
      commitCount: payload.commits.length,
      commitSha: payload.after,
      pusherName: payload.pusher.name,
      compareUrl: payload.compare,
    };

    // 4 – Exclude pusher from recipients
    //     actorUserId is set when we can resolve the GitHub user → internal user.
    const actorUserId = payload.actorUserId;
    const recipients = actorUserId
      ? members.filter((m) => m.id !== actorUserId)
      : members;

    this.logger.log(
      `GIT_PUSH on "${project.name}" / branch "${branch}" — ` +
      `${recipients.length} notification(s) to create.`,
    );

    // 5 – Create one notification per recipient and publish
    await Promise.all(
      recipients.map(async (recipient) => {
        const message = actorUserId
          ? `${payload.pusher.name} pushed ${payload.commits.length} commit(s) to "${branch}" in ${project.name}`
          : `${payload.commits.length} commit(s) were pushed to "${branch}" in ${project.name}`;

        const notification = await this.notificationsRepository.createNotification({
          recipientId: recipient.id,
          actorId: actorUserId,
          projectId: project.id,
          eventType: NotificationEventType.GIT_PUSH,
          message,
          metadata,
        });

        // Publish on the bus — the resolver subscription filters by recipientId
        this.pubSub.publish(NOTIFICATION_CREATED, {
          notificationCreated: this.toNotificationObject(notification, recipient, actorUserId),
          recipientId: recipient.id,
        });
      }),
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Converts a raw Notification entity (from createNotification)
   * to the shape expected by the GraphQL subscription payload.
   * Relations are only partially loaded after create, so we
   * fill in what we already have in memory.
   */
  private toNotificationObject(notification: any, recipient: any, actorId?: number) {
    return {
      id: notification.id,
      eventType: notification.eventType,
      message: notification.message,
      metadata: notification.metadata,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      readAt: notification.readAt ?? null,
      projectId: notification.project?.id ?? notification.projectId,
      recipient: {
        id: recipient.id,
        name: recipient.name,
        email: recipient.email,
      },
      actor: actorId ? { id: actorId, name: '', email: '' } : null,
    };
  }

  // ─── Query helpers (delegated from resolver) ──────────────────────────────

  getNotificationsForUser(userId: number, limit?: number, onlyUnread?: boolean) {
    return this.notificationsRepository.getNotificationsForUser(userId, limit, onlyUnread);
  }

  countUnread(userId: number) {
    return this.notificationsRepository.countUnread(userId);
  }

  markAsRead(notificationId: number, userId: number) {
    return this.notificationsRepository.markAsRead(notificationId, userId);
  }

  markAllAsRead(userId: number) {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  registerGitRepository(input: any) {
    return this.notificationsRepository.registerGitRepository(input);
  }
}
