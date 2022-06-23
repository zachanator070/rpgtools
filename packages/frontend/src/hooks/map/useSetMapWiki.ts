import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {SET_MAP_WIKI} from "@rpgtools/common/src/gql-mutations";

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
