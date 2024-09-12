import {useParams} from "react-router-dom";
import {GqlQueryResult} from "../useGQLQuery.js";
import {WikiPage} from "../../types.js";
import useGetWiki from "./useGetWiki.js";

interface CurrentWikiVariables {
	wikiId?: string;
}

interface CurrentWikiResult extends GqlQueryResult<WikiPage, CurrentWikiVariables>{
	currentWiki: WikiPage;
}

export default function useCurrentWiki(): CurrentWikiResult {
	const { wiki_id } = useParams();
	const result = useGetWiki(wiki_id);
	return {
		...result,
		currentWiki: result.wiki
	}
};
