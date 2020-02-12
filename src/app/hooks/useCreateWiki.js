import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import useCurrentWorld from "./useCurrentWorld";

const CREATE_WIKI = gql`
	mutation createWiki($name: String!, $folderId: ID!){
		createWiki(name: $name, folderId: $folderId){
			_id
		}
	}
`;

export const useCreateWiki = () => {
	const [createWiki, {data, loading, error}] = useMutation(CREATE_WIKI);
	const {refetch} = useCurrentWorld();
	return {
		createWiki: async (name, folderId) => {
			const result = await createWiki({variables: {name, folderId}});
			await refetch();
			return result.data.createWiki;
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		wiki: data ? data.createWiki : null
	}

};