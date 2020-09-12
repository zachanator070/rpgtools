import {useMutation} from "@apollo/client";
import {CREATE_WIKI} from "../../../../common/src/gql-queries";

export const useCreateWiki = () => {
	const [createWiki, {data, loading, error}] = useMutation(CREATE_WIKI);
	return {
		createWiki: async (name, folderId) => {
			const result = await createWiki({variables: {name, folderId}});
			return result.data.createWiki;
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		wiki: data ? data.createWiki : null
	}

};