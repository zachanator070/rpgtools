import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid";
import {User} from "./models/user";
import {ANON_USERNAME} from "../../common/src/permission-constants";

export const authenticated = next => (root, args, context, info) => {
	if (!context.currentUser || context.currentUser.username === ANON_USERNAME) {
		throw new Error(`Authentication is required for this action`);
	}

	return next(root, args, context, info);
};

export const createTokens = async user => {
	const accessToken = jwt.sign({userId: user._id}, process.env['ACCESS_TOKEN_SECRET'], {expiresIn: ACCESS_TOKEN_MAX_AGE.string});
	let version = uuidv4();
	const refreshToken = jwt.sign({version: version, userId: user._id}, process.env['REFRESH_TOKEN_SECRET'], {expiresIn: REFRESH_TOKEN_MAX_AGE.string});
	user.tokenVersion = version;
	await user.save();
	return {accessToken, refreshToken};
};

const getCurrentUser = async (userId) => {
	return User.findById(userId)
		.populate({path: 'currentWorld', populate: {path: 'wikiPage'}})
		.populate({path: 'permissions', populate: 'subject'})
		.populate({path: 'roles', populate: 'permissions'});
};

export const createSessionContext = async ({req, res}) => {

	let currentUser = null;

	const refreshToken = req.cookies["refreshToken"];
	const accessToken = req.cookies["accessToken"];
	if (refreshToken || accessToken) {
		try {
			let data = jwt.verify(accessToken, process.env['ACCESS_TOKEN_SECRET'], {maxAge: ACCESS_TOKEN_MAX_AGE.string});
			currentUser = await getCurrentUser(data.userId);
		} catch (e) {
			// accessToken is expired
			console.log(`Access token expired because ${e.message}`);
			res.clearCookie('accessToken');
			try {
				let data = jwt.verify(refreshToken, process.env['REFRESH_TOKEN_SECRET'], {maxAge: REFRESH_TOKEN_MAX_AGE.string});
				currentUser = await getCurrentUser(data.userId);
				// if refreshToken is still valid issue new access token and refresh token
				if (currentUser && currentUser.tokenVersion === data.version) {
					console.log('Access token and refresh token renewed b/c refresh token still valid');
					let tokens = await createTokens(currentUser);
					res.cookie('accessToken', tokens.accessToken, {maxAge: ACCESS_TOKEN_MAX_AGE.ms});
					res.cookie('refreshToken', tokens.refreshToken, {maxAge: REFRESH_TOKEN_MAX_AGE.ms});
				} else {
					// refreshToken was invalidated
					console.log(`Refresh token expired because version did not match ${currentUser.tokenVersion} !== ${data.version}`);
					currentUser = null;
					res.clearCookie('refreshToken');
				}
			} catch (e){
				// refreshToken is expired
				console.log(`Refresh token expired because ${e.message}`);
			}
		}
	}

	if(!currentUser){
		currentUser = new User({username: ANON_USERNAME});
	}

	await currentUser.recalculateAllPermissions();

	return {
		res,
		currentUser
	};
};

export const ACCESS_TOKEN_MAX_AGE = {string: '15min', ms: 1000 * 60 * 15};
export const REFRESH_TOKEN_MAX_AGE = {string: '1d', ms: 1000 * 60 * 60 * 24};