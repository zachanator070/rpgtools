import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { CURRENT_WIKI_PLACE_ATTRIBUTES } from "../gql-fragments";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Place} from "../../types";
import {GET_CURRENT_WIKI} from "./useCurrentWiki";

export const UPDATE_PLACE = gql`
	${CURRENT_WIKI_PLACE_ATTRIBUTES}
	mutation updatePlace($placeId: ID!, $mapImageId: ID, $pixelsPerFoot: Int){
		updatePlace(placeId: $placeId, mapImageId: $mapImageId, pixelsPerFoot: $pixelsPerFoot){
			_id
      		...currentWikiPlaceAttributes
		}
	}
`;

interface UpdatePlaceVariables {
	placeId: string;
	mapImageId?: string;
	pixelsPerFoot?: number;
}

interface UpdatePlaceResult {
	updatePlace: MutationMethod<Place, UpdatePlaceVariables>;
}

export default (): UpdatePlaceResult => {
	const result = useGQLMutation<Place, UpdatePlaceVariables>(UPDATE_PLACE, null, {
		refetchQueries: [GET_CURRENT_WIKI]
	});
	return {
		...result,
		updatePlace: result.mutate
	};
};
