import {DocumentNode, MutationHookOptions, useMutation} from "@apollo/client";
import {useGQLResponse} from "./useGQLResponse";
import {ApiHookResponse} from "./types";

export interface GqlMutationResult<TData, TVariables=void> extends ApiHookResponse<TData> {
	mutate: MutationMethod<TData, TVariables>
}

export type MutationMethod<TData, TVariables> = (variables?: TVariables) => Promise<TData>

interface GqlMutationOptions<TData, TVariables> extends MutationHookOptions<TData, TVariables> {
	displayErrors?: boolean;
}
export const useGQLMutation = <TData, TVariables=void>(
	query: DocumentNode,
	variables={},
	options: GqlMutationOptions<TData, TVariables> = { displayErrors: true }
): GqlMutationResult<TData, TVariables> => {
	const [mutation, { data, loading, error }] = useMutation<TData, TVariables>(query, options);

	if(!variables) {
		variables = {};
	}

	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		mutate: async (givenVariables?: TVariables) => {
			const originalVariables = Object.create(variables);
			Object.assign(originalVariables, givenVariables);
			const result = await mutation({ variables: originalVariables });
			return (result.data as any)[response.queryName];
		}
	};
};
