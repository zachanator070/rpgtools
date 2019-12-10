import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import useCurrentUser from "./useCurrentUser";
import useSetCurrentWorld from "./useSetCurrentWorld";

export const CREATE_WORLD = gql`
    mutation createWorld($name: String!, $public: Boolean!){
        createWorld(name: $name, public: $public){
            _id
        }
    }
`;

export default (callback) => {
	const {refetch} = useCurrentUser();
	const {setCurrentWorld} = useSetCurrentWorld();
	const [createWorld, {data, loading, error}] = useMutation(CREATE_WORLD, {
		async update(cache, response) {
			await refetch();
			await setCurrentWorld({variables: {worldId: response.data.createWorld._id}});
		},
		onCompleted: callback
	});
 	return {
 	    createWorld: async (name, isPublic) => {await createWorld({variables: {name, public: isPublic}})},
	    world: data ? data.createWorld : null,
	    errors: error ? error.graphQLErrors.map(error => error.message) : [],
	    loading
    };
}