import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { NotificationEventType } from '../../entities/notification.entity';
import { GraphQLScalarType, Kind } from 'graphql';

/** Simple JSON scalar — serializes any plain object to/from JSON. */
export const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    return null;
  },
});

// ─── Sub-objects ────────────────────────────────────────────────────────────

/** Typed metadata for GIT_PUSH events. */
@ObjectType()
export class GitPushMetadataObject {
  @Field()
  repository!: string;

  @Field()
  branch!: string;

  @Field(() => Int)
  commitCount!: number;

  @Field()
  commitSha!: string;

  @Field({ nullable: true })
  pusherName?: string;

  @Field({ nullable: true })
  compareUrl?: string;
}

/** Lightweight actor/recipient embedded in a notification. */
@ObjectType()
export class NotificationActorObject {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  email!: string;
}

// ─── Main object type ────────────────────────────────────────────────────────

@ObjectType()
export class NotificationObject {
  @Field(() => Int)
  id!: number;

  @Field(() => NotificationActorObject, { nullable: true })
  actor?: NotificationActorObject;

  @Field(() => NotificationActorObject)
  recipient!: NotificationActorObject;

  @Field(() => Int)
  projectId!: number;

  @Field(() => NotificationEventType)
  eventType!: NotificationEventType;

  @Field()
  message!: string;

  /**
   * Raw JSON metadata — typed as GraphQLJSON so the client gets
   * the exact shape without needing a union type.
   */
  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, unknown>;

  @Field()
  isRead!: boolean;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  readAt?: Date;
}

// ─── Subscription payload wrapper ────────────────────────────────────────────

/**
 * Wraps the notification + recipientId so the subscription filter
 * can exclude other users' events without hitting the DB again.
 */
@ObjectType()
export class NotificationCreatedPayload {
  @Field(() => NotificationObject)
  notificationCreated!: NotificationObject;

  /** Internal field used by the filter — not exposed to clients directly. */
  recipientId!: number;
}

// ─── Input types ─────────────────────────────────────────────────────────────

@InputType()
export class RegisterGitRepositoryInput {
  @Field(() => Int)
  projectId!: number;

  @Field()
  repositoryExternalId!: string;

  @Field()
  repoName!: string;

  @Field()
  repoUrl!: string;

  @Field({ nullable: true, defaultValue: 'github' })
  provider?: string;

  @Field({ nullable: true })
  webhookId?: string;
}
