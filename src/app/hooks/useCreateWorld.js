import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

export const CREATE_WORLD = gql`
    mutation createWorld($name: String!, $public: Boolean!){
        createWorld(name: $name, public: $public){
            _id
            wikiPage {
                _id
            }
        }
    }
`;

export default (callback) => {
	const [createWorld, {data, loading, error}] = useMutation(CREATE_WORLD, {
		onCompleted: callback
	});
 	return {
 	    createWorld: async (name, isPublic) => {
 	    	const response = await createWorld({variables: {name, public: isPublic}});
 	    	return response.data.createWorld;
        },
	    world: data ? data.createWorld : null,
	    errors: error ? error.graphQLErrors.map(error => error.message) : [],
	    loading
    };
}