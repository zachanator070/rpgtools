import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";

const SET_MAP_WIKI = gql`
	mutation setMapWiki($mapWikiId: ID!) {
		setMapWiki(mapWikiId: $mapWikiId) @client
	}
`;

interface SetMapWikiVariables {
	mapWikiId: string;
}

interface SetMapWikiResult extends GqlMutationResult<string, SetMapWikiVariables>{
	setMapWiki: MutationMethod<string, SetMapWikiVariables>;
}
export default (): SetMapWikiResult => {
	const result = useGQLMutation<string, SetMapWikiVariables>(SET_MAP_WIKI);
	return {
		...result,
		setMapWiki: result.mutate
	};
};
