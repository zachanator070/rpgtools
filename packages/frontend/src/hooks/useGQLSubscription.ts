import { useSubscription } from "@apollo/client";
import useGQLResponse from "./useGQLResponse";
import {ApiHookResponse} from "./types";
import getQueryName from "./getQueryName";

export interface GqlSubscriptionResult<TData> extends ApiHookResponse<TData> {}

export default function useGQLSubscription<TData, TVariables=void>(
	query,
	variables,
	options: { displayErrors?: boolean, onData?: (data: TData) => any} = { displayErrors: true, onData: null }
): GqlSubscriptionResult<TData> {
	const queryName = getQueryName(query);
	const { data, loading, error } = useSubscription(
		query,
		{
			variables,
			onData: ({ data }) => options.onData && options.onData(data.data[queryName])
		}
	);

	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading
	};
};
