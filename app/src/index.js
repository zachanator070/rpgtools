import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {ApolloProvider} from "@apollo/react-common";
import {BrowserRouter} from "react-router-dom";
import {getIntrospectionData} from "./components/get-introspection-data";
import {InMemoryCache, IntrospectionFragmentMatcher} from "apollo-cache-inmemory";
import {ApolloClient} from "apollo-client";
import {createUploadLink} from "apollo-upload-client";
import {clientTypeDefs} from "./clientTypeDefs";
import {clientResolvers} from "./clientResolvers";
import { WebSocketLink } from '@apollo/client/link/ws';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import './favicon.ico';

getIntrospectionData().then((introspectionData) => {
	const fragmentMatcher = new IntrospectionFragmentMatcher({
		introspectionQueryResultData: introspectionData
	});

	const cache = new InMemoryCache({fragmentMatcher});
	cache.writeData(
		{
			data: {
				loginModalVisibility: false,
				registerModalVisibility: false,
				createWorldModalVisibility: false,
				selectWorldModalVisibility: false,
				worldPermissionModalVisibility: false,
				editPinModalVisibility: false,
				permissionModalVisibility: false,
				mapWikiVisibility: false,
				pinBeingEdited: null,
				mapWiki: null,
				permissionEditorSubject: null,
				permissionEditorSubjectType: null,
			}
		}
	);

	const loc = window.location;
	let new_uri;
	if (loc.protocol === "https:") {
		new_uri = "wss:";
	} else {
		new_uri = "ws:";
	}
	new_uri += "//" + loc.host;
	new_uri += '/graphql';

	const httpLink = createUploadLink({
		uri: loc.protocol + '//' + window.location.host + '/api',
		credentials: 'same-origin',
	});

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	const wsLink = new WebSocketLink({
		uri: new_uri,
		options: {
			reconnect: true,
			connectionParams: {
				accessToken: getCookie('accessToken'),
			},
		}
	});

	// The split function takes three parameters:
	//
	// * A function that's called for each operation to execute
	// * The Link to use for an operation if the function returns a "truthy" value
	// * The Link to use for an operation if the function returns a "falsy" value
	const splitLink = split(
		({ query }) => {
			const definition = getMainDefinition(query);
			return (
				definition.kind === 'OperationDefinition' &&
				definition.operation === 'subscription'
			);
		},
		wsLink,
		httpLink,
	);

	const client = new ApolloClient({
		link: splitLink,
		cache: cache,
		typeDefs: clientTypeDefs,
		resolvers: clientResolvers,
		connectToDevTools: true
	});

	ReactDOM.render(<BrowserRouter> <ApolloProvider client={client}><App/></ApolloProvider></BrowserRouter>, document.getElementById('app'));
});
