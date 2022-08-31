import React from "react";
import App from "./components/App";
import { BrowserRouter } from "react-router-dom";
import { createUploadLink } from "apollo-upload-client";
import { clientTypeDefs } from "./clientTypeDefs";
import { clientResolvers } from "./clientResolvers";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { gql, ApolloClient, ApolloProvider, split, ApolloLink, InMemoryCache  } from "@apollo/client";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { getMainDefinition } from "@apollo/client/utilities";
import "./branding/favicon_old.ico";
import { RetryLink } from "@apollo/client/link/retry";
import fetchSubtypes from "./fetchSubtypes";
import {createRoot} from "react-dom/client";

fetchSubtypes().then(possibleTypes => {

	const cache = new InMemoryCache({
		possibleTypes,
		// need to test getting multiple pages of results to see if this is needed
		// typePolicies: {
		// 	Query: {
		// 		fields: {
		// 			wikisInFolder: {
		// 				merge(existing: WikiPagePaginatedResult, incoming: WikiPagePaginatedResult) {
		// 					if (existing) {
		// 						existing.docs = [...existing.docs, ...incoming.docs];
		// 						return existing;
		// 					}
		// 					return incoming;
		// 				},
		// 			}
		// 		}
		// 	}
		// }
	});
	cache.writeQuery({
		query: gql`
	  query GetMapWiki {
		mapWiki
	  }
	`,
		data: {
			mapWiki: null,
		},
	});

	const loc = window.location;
	let ws_url;
	if (loc.protocol === "https:") {
		ws_url = "wss:";
	} else {
		ws_url = "ws:";
	}
	ws_url += "//" + loc.host;
	ws_url += "/subscriptions";

	const httpLink = ApolloLink.from([
		new RetryLink({
			attempts: {
				max: 3,
			},
		}),
		createUploadLink({
			uri: loc.protocol + "//" + window.location.host + "/graphql",
			credentials: "same-origin",
			headers: {
				'Apollo-Require-Preflight': 'yes'
			}
		}),
	]);

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(";").shift();
	}

	const wsLink = new GraphQLWsLink(createClient({
		url: ws_url,
		connectionParams: () => {
			return {
				accessToken: getCookie("accessToken"),
				refreshToken: getCookie("refreshToken")
			}
		},
		shouldRetry: () => true,
		retryAttempts: 3,
	}));

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
	const splitLink = split(
		({ query }) => {
			const definition = getMainDefinition(query);
			return definition.kind === "OperationDefinition" && definition.operation === "subscription";
		},
		wsLink,
		httpLink
	);

	const client = new ApolloClient({
		link: splitLink,
		cache: cache,
		typeDefs: clientTypeDefs,
		resolvers: clientResolvers,
		connectToDevTools: true,
	});

	const root = createRoot(document.getElementById("app"));
	root.render(
		<DndProvider backend={HTML5Backend}>
			<BrowserRouter>
				<ApolloProvider client={client}>
					<App />
				</ApolloProvider>
			</BrowserRouter>
		</DndProvider>
	);
});
