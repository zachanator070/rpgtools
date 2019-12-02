import jwt from "jsonwebtoken";
import uuidv4 from "uuid/v4";

export const authenticated = next => (root, args, context, info) => {
	if (!context.currentUser) {
		throw new Error(`Unauthenticated!`);
	}

	return next(root, args, context, info);
};

export const createTokens = async user => {
	const accessToken = jwt.sign({userId: user._id}, process.env['ACCESS_TOKEN_SECRET'], {expiresIn: ACCESS_TOKEN_MAX_AGE.string});
	let version = uuidv4();
	const refreshToken = jwt.sign({version: version}, process.env['REFRESH_TOKEN_SECRET'], {expiresIn: REFRESH_TOKEN_MAX_AGE.string});
	user.tokenVersion = version;
	await user.save();
	return {accessToken, refreshToken};
};

export const ACCESS_TOKEN_MAX_AGE = {string: '15min', ms: 1000 * 60 * 15};
export const REFRESH_TOKEN_MAX_AGE = {string: '1d', ms: 1000 * 60 * 60 * 24};