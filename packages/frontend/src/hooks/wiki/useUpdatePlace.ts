import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Place} from "../../types";
import {GET_WIKI} from "@rpgtools/common/src/gql-queries";
import {UPDATE_PLACE} from "@rpgtools/common/src/gql-mutations";

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
		refetchQueries: [GET_WIKI]
	});
	return {
		...result,
		updatePlace: result.mutate
	};
};
