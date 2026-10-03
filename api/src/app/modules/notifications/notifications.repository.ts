import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationEventType, GitPushMetadata } from '../../entities/notification.entity';
import { GitRepository, GitProvider } from '../../entities/git-repository.entity';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { RegisterGitRepositoryInput } from './notifications.types';

export interface CreateNotificationDto {
  recipientId: number;
  actorId?: number;
  projectId: number;
  eventType: NotificationEventType;
  message: string;
  metadata?: GitPushMetadata | Record<string, unknown>;
}

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    @InjectRepository(GitRepository)
    private readonly gitRepoRepo: Repository<GitRepository>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) { }

  // ─── Notification CRUD ───────────────────────────────────────────────────

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepo.create({
      recipient: { id: dto.recipientId } as User,
      actor: dto.actorId ? ({ id: dto.actorId } as User) : undefined,
      project: { id: dto.projectId } as Project,
      eventType: dto.eventType,
      message: dto.message,
      metadata: dto.metadata,
    });
    return this.notificationRepo.save(notification);
  }

  /** Paginated notifications for a specific user, newest first. */
  async getNotificationsForUser(
    userId: number,
    limit = 20,
    onlyUnread = false,
  ): Promise<Notification[]> {
    const query = this.notificationRepo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.actor', 'actor')
      .leftJoinAndSelect('n.project', 'project')
      .where('n.recipientId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .take(limit);

    if (onlyUnread) {
      query.andWhere('n.isRead = false');
    }

    return query.getMany();
  }

  /** Count of unread notifications for the badge indicator. */
  async countUnread(userId: number): Promise<number> {
    return this.notificationRepo.count({
      where: { recipient: { id: userId }, isRead: false },
    });
  }

  /** Mark a single notification as read. Verifies ownership. */
  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, recipient: { id: userId } },
      relations: ['recipient', 'actor', 'project'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification #${notificationId} not found`);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepo.save(notification);
  }

  /** Mark all unread notifications as read for a user. */
  async markAllAsRead(userId: number): Promise<number> {
    const result = await this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('"recipientId" = :userId AND "isRead" = false', { userId })
      .execute();
    return result.affected ?? 0;
  }

  // ─── Git Repository ──────────────────────────────────────────────────────

  /**
   * Finds the GitRepository by its external ID + provider,
   * then eagerly loads the linked Project with all its members.
   * This is the critical lookup used during webhook processing.
   */
  async findRepoWithProjectAndMembers(
    repositoryExternalId: string,
    provider: GitProvider = GitProvider.GITHUB,
  ): Promise<GitRepository | null> {
    return this.gitRepoRepo.findOne({
      where: { repositoryExternalId, provider, isActive: true },
      relations: ['project', 'project.members'],
    });
  }

  async registerGitRepository(input: RegisterGitRepositoryInput): Promise<GitRepository> {
    const project = await this.projectRepo.findOneByOrFail({ id: input.projectId });

    const repo = this.gitRepoRepo.create({
      project,
      repositoryExternalId: input.repositoryExternalId,
      repoName: input.repoName,
      repoUrl: input.repoUrl,
      provider: (input.provider as GitProvider) ?? GitProvider.GITHUB,
      webhookId: input.webhookId,
    });

    return this.gitRepoRepo.save(repo);
  }

  async deactivateGitRepository(repositoryExternalId: string): Promise<void> {
    await this.gitRepoRepo.update({ repositoryExternalId }, { isActive: false });
  }
}
