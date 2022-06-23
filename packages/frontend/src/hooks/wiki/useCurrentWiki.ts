import {useParams} from "react-router-dom";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {WikiPage} from "../../types";
import {GET_CURRENT_WIKI} from "@rpgtools/common/src/gql-queries";

interface CurrentWikiVariables {
	wikiId?: string;
}

interface CurrentWikiResult extends GqlQueryResult<WikiPage, CurrentWikiVariables>{
	currentWiki: WikiPage;
}

export default (): CurrentWikiResult => {
	const { wiki_id } = useParams();
	const result = useGQLQuery<WikiPage, CurrentWikiVariables>(GET_CURRENT_WIKI, {wikiId: wiki_id});
	return {
		...result,
		currentWiki: result.data
	};
};
