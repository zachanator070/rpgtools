import useGQLMutation, {MutationMethod} from "../useGQLMutation.js";
import {Place} from "../../types.js";
import {GET_WIKI} from "@rpgtools/common/src/gql-queries.js";
import {UPDATE_PLACE} from "@rpgtools/common/src/gql-mutations.js";

interface UpdatePlaceVariables {
	placeId: string;
	mapImageId?: string;
	pixelsPerFoot?: number;
}

interface UpdatePlaceResult {
	updatePlace: MutationMethod<Place, UpdatePlaceVariables>;
}

export default function useUpdatePlace(): UpdatePlaceResult {
	const result = useGQLMutation<Place, UpdatePlaceVariables>(UPDATE_PLACE, null, {
		refetchQueries: [GET_WIKI]
	});
	return {
		...result,
		updatePlace: result.mutate
	};
};
