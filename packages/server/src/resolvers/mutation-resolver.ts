import { authorizationMutations } from "./mutations/authorization-mutations";
import { authenticationMutations } from "./mutations/authentication-mutations";
import { wikiFolderMutations } from "./mutations/wiki-folder-mutations";
import { worldMutations } from "./mutations/world-mutations";
import { wikiMutations } from "./mutations/wiki-mutations";
import { userResolvers } from "./mutations/user-mutations";
import { imageMutations } from "./mutations/image-mutations";
import { serverMutations } from "./mutations/server-mutations";
import { gameMutations } from "./mutations/game-mutations";
import { modelMutations } from "./mutations/model-mutations";

export default {
	...authenticationMutations,
	...worldMutations,
	...authorizationMutations,
	...wikiFolderMutations,
	...wikiMutations,
	...userResolvers,
	...imageMutations,
	...serverMutations,
	...gameMutations,
	...modelMutations,
};
