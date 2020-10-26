import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

export const MY_GAMES = gql`
  query myGames {
    myGames {
      _id
    }
  }
`;
export default () => {
  const { data, loading, error, refetch } = useQuery(MY_GAMES);
  return {
    loading,
    myGames: data ? data.myGames : null,
    errors: error ? error.graphQLErrors.map((error) => error.message) : [],
    refetch: refetch,
  };
};
