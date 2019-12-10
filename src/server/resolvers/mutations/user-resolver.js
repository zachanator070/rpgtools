import {authenticated} from "../../authentication-helpers";

export const userResolvers = {
	setCurrentWorld: authenticated(async (parent, {worldId}, {res, currentUser}) => {
		currentUser.currentWorld = worldId;
		await currentUser.save();
		await currentUser.populate('currentWorld').execPopulate();
		return currentUser;
	})
};