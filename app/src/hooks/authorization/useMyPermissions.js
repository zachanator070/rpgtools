import {useGQLQuery} from "../useGQLQuery";
import {MY_PERMISSIONS} from "../../../../common/src/gql-queries";
import {useParams} from "react-router-dom";

export const useMyPermissions = () => {
	const params = useParams();
	return useGQLQuery(MY_PERMISSIONS, {worldId: params.world_id});
};