import { authorizationMutations } from "./mutations/authorization-mutations.js";
import { authenticationMutations } from "./mutations/authentication-mutations.js";
import { wikiFolderMutations } from "./mutations/wiki-folder-mutations.js";
import { worldMutations } from "./mutations/world-mutations.js";
import { wikiMutations } from "./mutations/wiki-mutations.js";
import { userResolvers } from "./mutations/user-mutations.js";
import { imageMutations } from "./mutations/image-mutations.js";
import { serverConfigMutations } from "./mutations/server-config-mutations.js";
import { gameMutations } from "./mutations/game-mutations.js";
import { modelMutations } from "./mutations/model-mutations.js";

export default {
	...authenticationMutations,
	...worldMutations,
	...authorizationMutations,
	...wikiFolderMutations,
	...wikiMutations,
	...userResolvers,
	...imageMutations,
	...serverConfigMutations,
	...gameMutations,
	...modelMutations,
};
