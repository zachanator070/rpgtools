import {FetchResult, MutationHookOptions, useMutation} from "@apollo/client";
import {useGQLResponse} from "./useGQLResponse";
import {ApiHookResponse} from "./types";

export interface GqlMutationResult<TData, TVariables=void> extends ApiHookResponse<TData> {
	mutate: MutationMethod<TData, TVariables>
}

export type MutationMethod<TData, TVariables> = (variables?: TVariables) => Promise<FetchResult<TData>>

interface GqlMutationOptions extends MutationHookOptions {
	displayErrors?: boolean;
}
export const useGQLMutation = <TData, TVariables=void>(
	query,
	variables={},
	options: GqlMutationOptions = { onCompleted: () => {}, displayErrors: true }
): GqlMutationResult<TData, TVariables> => {
	const [mutation, { data, loading, error }] = useMutation<TData, TVariables>(query, {
		onCompleted: options.onCompleted,
	});

	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		mutate: async (givenVariables?: TVariables) => {
			const mutationVariables = variables
				? Object.assign(givenVariables, variables)
				: givenVariables;
			const result = await mutation({ variables: mutationVariables });
			return result.data[response.queryName];
		}
	};
};
