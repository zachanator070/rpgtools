import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { BrowserRouter } from "react-router-dom";
import { createUploadLink } from "apollo-upload-client";
import { clientTypeDefs } from "./clientTypeDefs";
import { clientResolvers } from "./clientResolvers";
import { WebSocketLink } from "@apollo/client/link/ws";
import { gql, ApolloClient, ApolloProvider, split, ApolloLink, InMemoryCache  } from "@apollo/client";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { getMainDefinition } from "@apollo/client/utilities";
// import "./favicon.ico";
import { RetryLink } from "@apollo/client/link/retry";

const cache = new InMemoryCache();
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
let new_uri;
if (loc.protocol === "https:") {
	new_uri = "wss:";
} else {
	new_uri = "ws:";
}
new_uri += "//" + loc.host;
new_uri += "/graphql";

const httpLink = ApolloLink.from([
	new RetryLink({
		attempts: {
			max: 3,
		},
	}),
	createUploadLink({
		uri: loc.protocol + "//" + window.location.host + "/api",
		credentials: "same-origin",
	}),
]);

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(";").shift();
}

const wsLink = new WebSocketLink({
	uri: new_uri,
	options: {
		reconnect: true,
		connectionParams: {
			accessToken: getCookie("accessToken"),
		},
	},
});

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

ReactDOM.render(
	<DndProvider backend={HTML5Backend}>
		<BrowserRouter>
			<ApolloProvider client={client}>
				<App />
			</ApolloProvider>
		</BrowserRouter>
	</DndProvider>,
	document.getElementById("app")
);
