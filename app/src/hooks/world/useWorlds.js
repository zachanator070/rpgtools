import {useQuery} from "@apollo/client";
import gql from "graphql-tag";

export const GET_WORLDS = gql`
	query getWorlds($page: Int!){
		worlds(page: $page){
			docs{
				_id
				name
				wikiPage {
					_id
					type
				}
			}
			totalPages
		}	
	}
`;
export default (page) => {
	const {data, loading, error} = useQuery(GET_WORLDS, {variables: {page}});
	return {
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		worlds: data ? data.worlds : null
	}
};