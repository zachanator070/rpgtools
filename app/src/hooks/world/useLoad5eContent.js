import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {CURRENT_WORLD_FOLDERS} from "../../../../common/src/gql-fragments";

export const LOAD_5E_CONTENT = gql`
	mutation load5eContent($worldId: ID!, $creatureCodex: Boolean, $tomeOfBeasts: Boolean){
		load5eContent(worldId: $worldId, creatureCodex: $creatureCodex, tomeOfBeasts: $tomeOfBeasts){
			_id
			folders{
			    ${CURRENT_WORLD_FOLDERS}
		    }
		    rootFolder{
			    ${CURRENT_WORLD_FOLDERS}
		    }
		}
	}
`;
export const useLoad5eContent = () => {
	return useGQLMutation(LOAD_5E_CONTENT);
}