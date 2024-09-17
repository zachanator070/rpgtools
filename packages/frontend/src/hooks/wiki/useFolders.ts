import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {WikiFolder} from "../../types.js";
import {useParams} from 'react-router-dom';
import {FOLDERS} from "@rpgtools/common/src/gql-queries.js";

interface FoldersVariables {
	worldId?: string;
	name?: string;
	canAdmin?: boolean;
}

interface FoldersResult extends GqlQueryResult<WikiFolder[], FoldersVariables>{
	folders: WikiFolder[]
}

export default function useFolders(variables: FoldersVariables = {}): FoldersResult {
	const params = useParams();
	if (!variables.worldId) {
		variables.worldId = params.world_id;
	}
	const result = useGQLQuery<WikiFolder[], FoldersVariables>(FOLDERS, variables);
	return {
		...result,
		folders: result.data
	};
};
