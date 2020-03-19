import {useMutation} from "@apollo/react-hooks";
import {CREATE_WORLD} from "../../../common/src/gql-queries";

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