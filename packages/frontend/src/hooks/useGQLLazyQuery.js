import {useLazyQuery, useQuery} from "@apollo/client";
import {useGQLResponse} from "./useGQLResponse";


export const useGQLLazyQuery = (query, variables, options={onCompleted:() => {}, displayErrors: true}) => {
    const [fetch, {data, loading, error, refetch}] = useLazyQuery(query, {variables, onCompleted: options.onCompleted});
    const response = useGQLResponse(query, data, error, options.displayErrors);
    response.fetch = async (variables) => await fetch({variables});
    response.loading = loading;
    response.refetch = refetch;
    response[response.queryName] = response.data;
    return response;
};