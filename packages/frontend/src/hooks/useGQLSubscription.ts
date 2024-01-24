import { useSubscription } from "@apollo/client";
import useGQLResponse from "./useGQLResponse";
import { GQLResult } from "./types";

export interface GqlSubscriptionResult<TData> extends GQLResult<TData> {}

export default function useGQLSubscription<TEntity, TData>(
	query,
	variables,
	options = { displayErrors: true },
): GqlSubscriptionResult<TEntity> {
	const { data, loading, error } = useSubscription(query, { variables });

	const response = useGQLResponse<TEntity, TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
	};
}
