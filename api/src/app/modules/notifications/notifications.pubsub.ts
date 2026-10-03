import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

// Singleton instance — isolated from the projects PubSub so events don't cross.
const pubSubInstance = new PubSub();

/** Trigger name used when a new notification is broadcast to a specific user. */
export const NOTIFICATION_CREATED = 'NOTIFICATION_CREATED';

@Injectable()
export class NotificationsPubSub {
  asyncIterator(triggers: string | string[]) {
    return pubSubInstance.asyncIterableIterator(triggers);
  }

  publish(triggerName: string, payload: any) {
    return pubSubInstance.publish(triggerName, payload);
  }
}
