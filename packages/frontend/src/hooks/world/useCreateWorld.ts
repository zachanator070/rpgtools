import gql from "graphql-tag";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const CREATE_WORLD = gql`
	mutation createWorld($name: String!, $public: Boolean!) {
		createWorld(name: $name, public: $public) {
			_id
			wikiPage {
				_id
			}
		}
	}
`;

interface CreateWorldVariables {
	name: string;
	public: boolean;
}

interface CreateWorldResult extends GqlMutationResult<World,  CreateWorldVariables> {
	createWorld: MutationMethod<World, CreateWorldVariables>
}

export default (callback): CreateWorldResult => {
	const result = useGQLMutation<World, CreateWorldVariables>(CREATE_WORLD, {}, {onCompleted: callback});
	return {
		...result,
		createWorld: result.mutate
	};
};
