import QueryResolver from "./query-resolver.js";
import MutationResolver from "./mutation-resolver.js";
import { TypeResolvers } from "./type-resolvers.js";
import { SubscriptionResolvers } from "./subscription-resolvers.js";

export const allResolvers = {
	Query: QueryResolver,
	Mutation: MutationResolver,
	Subscription: SubscriptionResolvers,
	...TypeResolvers,
};
