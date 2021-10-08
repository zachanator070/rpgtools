import { useSubscription } from "@apollo/client";
import { useGQLResponse } from "./useGQLResponse";
import {ApiHookResponse} from "./types";

export interface GqlSubscriptionResult<TData> extends ApiHookResponse<TData> {}

export const useGQLSubscription = <TData, TVariables=void>(
	query,
	variables,
	options = { displayErrors: true }
): GqlSubscriptionResult<TData> => {
	const { data, loading, error } = useSubscription(query, { variables });

	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading
	};
};
