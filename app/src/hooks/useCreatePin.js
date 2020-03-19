import {useMutation} from "@apollo/react-hooks";
import {CREATE_PIN} from "../../../common/src/gql-queries";

export default () => {
	const [createPin, {data, loading, error}] = useMutation(CREATE_PIN);
	return {
		createPin: async (mapId, x, y, wikiId) => {
			return await createPin({variables: {mapId, x, y, wikiId}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};