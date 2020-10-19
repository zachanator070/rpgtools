import gql from "graphql-tag";
import {CURRENT_WORLD_WIKIS} from "../../../../common/src/gql-fragments";
import {useGQLQuery} from "../useGQLQuery";
import {useGQLLazyQuery} from "../useGQLLazyQuery";
import {useEffect} from "react";

const WIKIS_IN_FOLDER = gql`
    query wikisInFolder($folderId: ID!, $page: Int){
        wikisInFolder(folderId: $folderId, page: $page){
            docs{
                ${CURRENT_WORLD_WIKIS}
                folder{
                    _id
                    name
                }
                world{
                    _id
                }
            }
            nextPage
        }
    }
`;

export const useWikisInFolder = (variables) => {
    const result = useGQLLazyQuery(WIKIS_IN_FOLDER, variables);
    useEffect(() => {
        if(variables){
            (async () => {
                await result.fetch();
            })();
        }
    }, []);
    const fetchMore = result.fetchMore;
    result.fetchMore = async (variables) => {
        await fetchMore({
            variables,
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;

                return{
                    wikisInFolder: {
                        docs: [...prev.wikisInFolder.docs, ...fetchMoreResult.wikisInFolder.docs],
                        nextPage: fetchMoreResult.wikisInFolder.nextPage,
                        __typename: 'WikiPagePaginatedResult'
                    }
                }
            }
        })
    };
    useEffect(() => {
        if(result.wikisInFolder && result.wikisInFolder.nextPage){
            (async () => {
                await result.fetchMore({...variables, page: result.wikisInFolder.nextPage});
            })();
        }
    }, [result.wikisInFolder]);
    return result;
};