import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
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
	public: string;
}

interface CreateWorldResult {
	createWorld: MutationMethod<World, CreateWorldVariables>
}

export default (callback): CreateWorldResult => {
	const result = useGQLMutation<World, CreateWorldVariables>(CREATE_WORLD, {}, {onCompleted: callback});
	return {
		...result,
		createWorld: result.mutate
	};
};
