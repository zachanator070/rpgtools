import {useQuery} from "@apollo/client";
import {useGQLResponse} from "./useGQLResponse";


export const useGQLQuery = (query, variables, options={onCompleted:() => {}, displayErrors: true}) => {
	const {data, loading, error, refetch, fetchMore} = useQuery(query, {variables, onCompleted: options.onCompleted});
	const response = useGQLResponse(query, data, error, options.displayErrors);
	response.loading = loading;
	response.refetch = refetch;
	response.fetchMore = fetchMore;
	response[response.queryName] = response.data;
	return response;
};