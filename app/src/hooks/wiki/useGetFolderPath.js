import gql from "graphql-tag";
import {useGQLLazyQuery} from "../useGQLLazyQuery";

const GET_FOLDER_PATH = gql`
    query getFolderPath($wikiId: ID!){
        getFolderPath(wikiId: $wikiId){
            _id
            name
        }
    }
`;

export const useGetFolderPath = () => {
    return useGQLLazyQuery(GET_FOLDER_PATH);
}