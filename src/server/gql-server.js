import {ApolloServer} from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import {User} from './models/user';
import {ACCESS_TOKEN_MAX_AGE, createTokens, REFRESH_TOKEN_MAX_AGE} from "./authentication-helpers";
import {typeDefs} from './gql-schema';
import {serverResolvers} from "./resolvers/server-resolvers";


export default new ApolloServer({
	typeDefs,
	resolvers: serverResolvers,
    playground: {
        settings: {
            "editor.cursorShape": "line",
            "editor.fontFamily": "'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace",
            "editor.fontSize": 14,
            "editor.reuseHeaders": true,
            "editor.theme": "dark",
            "general.betaUpdates": false,
            "prettier.printWidth": 80,
            "prettier.tabWidth": 2,
            "prettier.useTabs": false,
            "schema.disableComments": true,
            "schema.polling.enable": true,
            "schema.polling.endpointFilter": "*localhost*",
            "schema.polling.interval": 2000,
            "tracing.hideTracingResponse": true,
            "queryPlan.hideQueryPlanResponse": true,
            "request.credentials": "same-origin"
        },
    },
	context: async ({req, res}) => {

		let currentUser = null;

		const refreshToken = req.cookies["refreshToken"];
		const accessToken = req.cookies["accessToken"];
		if (refreshToken && accessToken) {
			try {
				let data = jwt.verify(accessToken, process.env['ACCESS_TOKEN_SECRET'], {maxAge: ACCESS_TOKEN_MAX_AGE.string});
				currentUser = await User.findOne({_id: data.userId}).populate({path: 'permissions'}).populate({
					path: 'roles',
					populate: {
						path: 'permissions'
					}
				});
			} catch (e) {
				// accessToken is expired
				try {
					let data = jwt.verify(refreshToken, process.env['REFRESH_TOKEN_SECRET'], {maxAge: REFRESH_TOKEN_MAX_AGE.string});
					currentUser = await User.findOne({_id: data.userId}).populate({path: 'permissions'}).populate({
						path: 'roles',
						populate: {
							path: 'permissions'
						}
					});
					// if refreshToken is still valid issue new access token and refresh token
					if (currentUser && currentUser.tokenVersion === data.version) {
						let tokens = await createTokens(currentUser);
						res.cookie("refresh-token", tokens.refreshToken);
						res.cookie("access-token", tokens.accessToken);
					} else {
						// refreshToken was invalidated
						currentUser = null;
					}
				} catch {
					// refreshToken is expired
				}
			}
		}

		return {
			res,
			currentUser,
		};
	},
});