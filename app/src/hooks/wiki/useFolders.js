import {useGQLLazyQuery} from "../useGQLLazyQuery";
import useCurrentWorld from "../world/useCurrentWorld";
import {useEffect} from "react";
import gql from "graphql-tag";

const FOLDERS = gql`
    query folders($worldId: ID!){
        folders(worldId: $worldId){
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

export const useFolders = () => {
    const {currentWorld, loading} = useCurrentWorld();
    const result = useGQLLazyQuery(FOLDERS);
    if(loading){
        result.loading = loading || result.loading;
    }

    useEffect(() => {
        if(currentWorld){
            result.fetch({worldId: currentWorld._id});
        }
    }, [currentWorld]);
    return result;
}