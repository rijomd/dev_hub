import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { registerEnumType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Project } from './project.entity';

export enum NotificationEventType {
  GIT_PUSH = 'GIT_PUSH',
  GIT_PULL_REQUEST = 'GIT_PULL_REQUEST',
  GIT_PULL_REQUEST_MERGED = 'GIT_PULL_REQUEST_MERGED',
  GIT_BRANCH_CREATED = 'GIT_BRANCH_CREATED',
  GIT_BRANCH_DELETED = 'GIT_BRANCH_DELETED',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
}

registerEnumType(NotificationEventType, { name: 'NotificationEventType' });

export interface GitPushMetadata {
  repository: string;
  branch: string;
  commitCount: number;
  commitSha: string;
  pusherName?: string;
  compareUrl?: string;
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  /** The user who receives this notification. */
  @ManyToOne(() => User, (user) => user.receivedNotifications, {
    onDelete: 'CASCADE',
  })
  recipient!: Relation<User>;

  /** The user who triggered the event (e.g. the developer who pushed). Nullable for system events. */
  @ManyToOne(() => User, (user) => user.sentNotifications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  actor?: Relation<User>;

  /** The project this notification belongs to. */
  @ManyToOne(() => Project, (project) => project.notifications, {
    onDelete: 'CASCADE',
  })
  project!: Relation<Project>;

  @Column({ type: 'varchar' })
  eventType!: NotificationEventType;

  @Column({ type: 'text' })
  message!: string;

  /**
   * Flexible JSON payload that varies per event type.
   * For GIT_PUSH: { repository, branch, commitCount, commitSha, pusherName, compareUrl }
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: GitPushMetadata | Record<string, unknown>;

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date;
}
