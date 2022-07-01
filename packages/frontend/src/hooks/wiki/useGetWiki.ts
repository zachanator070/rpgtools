import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {WikiPage} from "../../types";
import {GET_WIKI} from "@rpgtools/common/src/gql-queries";

interface GetWikiVariables {
    wikiId?: string;
}

interface GetWikiResult extends GqlQueryResult<WikiPage, GetWikiVariables>{
    wiki: WikiPage;
}

export default function useGetWiki(wikiId: string): GetWikiResult {

    const result = useGQLQuery<WikiPage, GetWikiVariables>(GET_WIKI, {wikiId: wikiId});
    return {
        ...result,
        wiki: result.data
    };

}