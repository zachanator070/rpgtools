import QueryResolver from "./query-resolver";
import MutationResolver from "./mutation-resolver";
import {userHasPermission} from "../authorization-helpers";
import {ROLE_ADMIN} from "../../permission-constants";

export const serverResolvers = {
	Query: QueryResolver,
	Mutation: MutationResolver,
	World: {
		roles: async (world, _, {currentUser}) => {
			if(await userHasPermission(currentUser, ROLE_ADMIN, world._id, world._id)){
				return world.roles;
			}
			return [];
		}
	}
};