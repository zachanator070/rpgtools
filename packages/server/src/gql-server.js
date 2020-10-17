import {ApolloServer, PubSub} from 'apollo-server-express';
import {ACCESS_TOKEN_MAX_AGE, createSessionContext, getCurrentUser} from "./authentication-helpers";
import {typeDefs} from './gql-server-schema';
import {serverResolvers} from "./resolvers/server-resolvers";
import jwt from "jsonwebtoken";
import {User} from "./models/user";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";

const ps = new PubSub();
export const pubsub = ps;

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
            "schema.polling.enable": false,
            "schema.polling.endpointFilter": "*localhost*",
            "schema.polling.interval": 2000,
            "tracing.hideTracingResponse": true,
            "queryPlan.hideQueryPlanResponse": true,
            "request.credentials": "same-origin"
        },
    },
	context: createSessionContext,
    uploads: false,
    subscriptions: {
        onConnect: async (connectionParams, webSocket) => {
            let currentUser = null;
            if (connectionParams.accessToken) {
                let data = jwt.verify(connectionParams.accessToken, process.env['ACCESS_TOKEN_SECRET'], {maxAge: ACCESS_TOKEN_MAX_AGE.string});
                currentUser = await getCurrentUser(data.userId);
            }
            else {
                currentUser = new User({username: ANON_USERNAME});
            }
            await currentUser.recalculateAllPermissions();
            return {currentUser};
        },
        keepAlive: 1000
    },
});