import gql from "graphql-tag";
import {useGQLQuery} from "../useGQLQuery";

const FOLDERS = gql`
    query folders($worldId: ID!, $name: String){
        folders(worldId: $worldId, name: $name){
            _id
            name
            children{
                _id
                name
            }
            canWrite
            canAdmin
        }
    }
`;

export const useFolders = (variables) => {
    return useGQLQuery(FOLDERS, variables);
}