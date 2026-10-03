import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity';
import { GitRepository } from '../../entities/git-repository.entity';
import { Project } from '../../entities/project.entity';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsPubSub } from './notifications.pubsub';
import { GitHubWebhookController } from './github-webhook.controller';
import { AuthModule } from '../auth/auth.module';
import { GraphQLJSON } from './notifications.types';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, GitRepository, Project]),
    AuthModule,   // provides GqlJwtAuthGuard + JwtService
  ],
  controllers: [GitHubWebhookController],
  providers: [
    NotificationsRepository,
    NotificationsService,
    NotificationsResolver,
    NotificationsPubSub,
    // Register the inline JSON scalar so Apollo schema generation picks it up
    { provide: 'JSON', useValue: GraphQLJSON },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule { }
