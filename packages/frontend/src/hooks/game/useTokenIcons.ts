import {useParams} from "react-router-dom";
import useGQLQuery from "../useGQLQuery";
import {GET_TOKEN_ICONS} from "@rpgtools/common/src/gql-queries";

interface TokenIcon {
	_id: string;
	image: {
		_id: string;
	};
	world: {
		_id: string;
	};
}

interface TokenIconsResult {
	docs: TokenIcon[];
	page: number;
	pageCount: number;
}

interface TokenIconsVariables {
	worldId: string;
	page?: number;
}

export default function useTokenIcons(page?: number) {
	const { world_id } = useParams();

	return useGQLQuery<TokenIconsResult, TokenIconsVariables>(
		GET_TOKEN_ICONS,
		{ worldId: world_id, page: page || 1 }
	);
}
