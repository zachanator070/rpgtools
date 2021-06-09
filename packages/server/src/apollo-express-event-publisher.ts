import { EventPublisher } from "./types";
import { PubSub } from "apollo-server-express";
import { injectable } from "inversify";

@injectable()
export class ApolloExpressEventPublisher implements EventPublisher {
	pubsub = new PubSub();

	asyncIterator(events: string[]): AsyncIterator<any> {
		return this.pubsub.asyncIterator(events);
	}

	publish(event: string, payload: any): Promise<void> {
		return this.pubsub.publish(event, payload);
	}
}
