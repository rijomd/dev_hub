import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

// Create a pure, unaltered instance
const pubSubInstance = new PubSub();

@Injectable()
export class ProjectsPubSub {
  // Expose the necessary methods safely
  asyncIterator(triggers: string | string[]) {
    return pubSubInstance.asyncIterableIterator(triggers);
  }

  publish(triggerName: string, payload: any) {
    return pubSubInstance.publish(triggerName, payload);
  }
}
