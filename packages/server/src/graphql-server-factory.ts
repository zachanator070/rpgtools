import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./gql-server-schema";
import { serverResolvers } from "./resolvers/server-resolvers";

import jwt from "jsonwebtoken";
import { ANON_USERNAME } from "../../common/src/permission-constants";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "./injectable-types";
import { ACCESS_TOKEN_MAX_AGE, AuthenticationService } from "./services/authentication-service";
import { SessionContextFactory } from "./types";
import { v4 as uuidv4 } from "uuid";
import { User } from "./domain-entities/user";

export class GraphqlConnectionContextFactory {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	create = async (connectionParams: any, webSocket: any) => {
		let currentUser = null;
		if (connectionParams.accessToken) {
			let data: any = jwt.verify(connectionParams.accessToken, process.env["ACCESS_TOKEN_SECRET"], {
				maxAge: ACCESS_TOKEN_MAX_AGE.string,
			});
			currentUser = await this.authenticationService.getCurrentUser(data.userId);
		} else {
			currentUser = new User(uuidv4(), "", ANON_USERNAME, "", "", null, [], []);
		}
		return { currentUser };
	};
}

export class GraphqlServerFactory {
	connectionContextFactory: GraphqlConnectionContextFactory = new GraphqlConnectionContextFactory();

	@inject(INJECTABLE_TYPES.SessionContextFactory)
	sessionContextFactory: SessionContextFactory;

	create = (): ApolloServer => {
		return new ApolloServer({
			typeDefs,
			resolvers: serverResolvers,
			playground: {
				settings: {
					"editor.cursorShape": "line",
					"editor.fontFamily":
						"'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace",
					"editor.fontSize": 14,
					"editor.reuseHeaders": true,
					"editor.theme": "dark",
					"general.betaUpdates": false,
					"schema.polling.enable": false,
					"schema.polling.endpointFilter": "*localhost*",
					"schema.polling.interval": 2000,
					"tracing.hideTracingResponse": true,
					"queryPlan.hideQueryPlanResponse": true,
					"request.credentials": "same-origin",
				},
			},
			context: this.sessionContextFactory.create,
			uploads: false,
			subscriptions: {
				onConnect: this.connectionContextFactory.create,
				keepAlive: 1000,
			},
			tracing: process.env.NODE_ENV === "development",
		});
	};
}
