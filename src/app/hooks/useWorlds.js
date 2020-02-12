import {useQuery} from "@apollo/react-hooks";
import gql from "graphql-tag";

const GET_WORLDS = gql`
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