import { useGQLMutation } from "../useGQLMutation";
import gql from "graphql-tag";
import { CURRENT_WORLD_FOLDERS } from "../gql-fragments";

export const LOAD_5E_CONTENT = gql`
	${CURRENT_WORLD_FOLDERS}
	mutation load5eContent($worldId: ID!, $creatureCodex: Boolean, $tomeOfBeasts: Boolean){
		load5eContent(worldId: $worldId, creatureCodex: $creatureCodex, tomeOfBeasts: $tomeOfBeasts){
			_id
		    rootFolder{
			    ...currentWorldFolders
		    }
		}
	}
`;
export const useLoad5eContent = () => {
	return useGQLMutation(LOAD_5E_CONTENT);
};
