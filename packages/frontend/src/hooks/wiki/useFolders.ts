import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {WikiFolder} from "../../types";
import {useParams} from 'react-router-dom';
import {FOLDERS} from "@rpgtools/common/src/gql-queries";

interface FoldersVariables {
	worldId?: string;
	name?: string;
	canAdmin?: boolean;
}

interface FoldersResult extends GqlQueryResult<WikiFolder[], FoldersVariables>{
	folders: WikiFolder[]
}

export const useFolders = (variables?: FoldersVariables): FoldersResult => {
	const params = useParams();
	if (variables.worldId === null) {
		variables.worldId = params.world_id;
	}
	const result = useGQLQuery<WikiFolder[], FoldersVariables>(FOLDERS, variables);
	return {
		...result,
		folders: result.data
	};
};
