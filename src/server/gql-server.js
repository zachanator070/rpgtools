import {ApolloServer} from 'apollo-server-express';

import {
	createSessionContext,
} from "./authentication-helpers";
import {typeDefs} from './gql-server-schema';
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
            "schema.polling.enable": false,
            "schema.polling.endpointFilter": "*localhost*",
            "schema.polling.interval": 2000,
            "tracing.hideTracingResponse": true,
            "queryPlan.hideQueryPlanResponse": true,
            "request.credentials": "same-origin"
        },
    },
	context: createSessionContext,
});