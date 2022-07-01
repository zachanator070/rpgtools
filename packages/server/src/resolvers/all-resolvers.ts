import QueryResolver from "./query-resolver";
import MutationResolver from "./mutation-resolver";
import { TypeResolvers } from "./type-resolvers";
import { SubscriptionResolvers } from "./subscription-resolvers";

export const allResolvers = {
	Query: QueryResolver,
	Mutation: MutationResolver,
	Subscription: SubscriptionResolvers,
	...TypeResolvers,
};
