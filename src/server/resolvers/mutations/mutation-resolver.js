
import {authorizationResolver} from "./authorization-resolver";
import {authenticationResolvers} from "./authentication-resolvers";
import {folderResolvers} from "./folder-resolvers";
import {worldResolvers} from "./world-resolvers";
import {wikiResolvers} from "./wiki-resolvers";
import {userResolvers} from "./user-resolver";
import {imageResolvers} from './image-resolvers';

export default {

	...authenticationResolvers,
	...worldResolvers,
	...authorizationResolver,
	...folderResolvers,
	...wikiResolvers,
	...userResolvers,
	...imageResolvers
}