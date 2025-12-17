import {useParams} from "react-router-dom";
import useGQLQuery from "../useGQLQuery";
import {GET_TOKEN_ICONS} from "@rpgtools/common/src/gql-queries";
import { TokenIconPaginatedResult } from "../../types";

interface TokenIconsVariables {
	worldId: string;
	name?: string;
	page?: number;
}

export default function useTokenIcons() {
	const { world_id } = useParams();
	const variables: TokenIconsVariables = {
		worldId: world_id
	};

	const result = useGQLQuery<TokenIconPaginatedResult, TokenIconsVariables>(
		GET_TOKEN_ICONS,
		variables
	);

	return {
		...result,
		data: result.data,
	};
}
