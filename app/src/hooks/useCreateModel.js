import {useMutation} from "@apollo/client";
import {CREATE_MODEL} from "../../../common/src/gql-queries";
import useCurrentWorld from "./useCurrentWorld";

export const useCreateModel = (callback) => {
	const {currentWorld} = useCurrentWorld();
	const [createModel, {data, loading, error}] = useMutation(CREATE_MODEL, {
		onCompleted: callback
	});
	return {
		createModel: async (name, file, depth, width, height) => {
			const result = await createModel({variables: {name, file, worldId: currentWorld._id, depth, width, height}});
			return result.data.createModel;
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		wiki: data ? data.createWiki : null
	}

};