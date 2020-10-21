import { useSubscription } from "@apollo/client";
import { useGQLResponse } from "./useGQLResponse";

export const useGQLSubscription = (
  query,
  variables,
  options = { displayErrors: true }
) => {
  const { data, loading, error } = useSubscription(query, { variables });

  const response = useGQLResponse(query, data, error, options.displayErrors);
  response.loading = loading;
  response[response.queryName] = response.data;
  return response;
};
