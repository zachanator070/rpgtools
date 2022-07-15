import {useParams} from "react-router-dom";
import {GqlQueryResult} from "../useGQLQuery";
import {WikiPage} from "../../types";
import useGetWiki from "./useGetWiki";

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
