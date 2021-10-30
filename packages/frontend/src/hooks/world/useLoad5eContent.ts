import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import { CURRENT_WORLD_FOLDERS } from "../gql-fragments";
import {World} from "../../types";

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

interface Load5eContentVariables {
	worldId: string;
}

interface Load5eContentResult {
	load5eContent: MutationMethod<World, Load5eContentVariables>;
}

export const useLoad5eContent = (): Load5eContentResult => {
	const result = useGQLMutation<World, Load5eContentVariables>(LOAD_5E_CONTENT);
	return {
		...result,
		load5eContent: result.mutate
	};
};
