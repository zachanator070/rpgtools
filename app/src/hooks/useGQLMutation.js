import {useMutation} from "@apollo/client";
import {useGQLResponse} from "./useGQLResponse";


export const useGQLMutation = (query, variables, options={onCompleted:() => {}, displayErrors:true}) => {

	const [mutation, {data, loading, error}] = useMutation(query, {variables, onCompleted: options.onCompleted});

	const response = useGQLResponse(query, data, error, options.displayErrors);
	response.loading = loading;
	response[response.queryName] = async (mutationVariables) => {
		const result = await mutation({variables: mutationVariables});
		return result.data[response.queryName];
	};
	return response;

};