import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";


const GET_CURRENT_WIKI = gql`
    query {
        currentWiki @client {
            name
            content
            public
            world {
                _id
            }
            coverImage {
                width
                height
                chunks{
                    _id
                }
            }
        }
    }
`;

export default () => {
	const {data, loading, error} = useQuery(GET_CURRENT_WIKI);
	return {
		currentWiki: data ? data.currentWiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}