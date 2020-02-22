import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {ApolloClient} from "apollo-client";
import {createUploadLink} from 'apollo-upload-client'
import {InMemoryCache, IntrospectionFragmentMatcher} from "apollo-cache-inmemory";
import {ApolloProvider} from "@apollo/react-common";
import {clientResolvers} from "./clientResolvers";
import {clientTypeDefs} from "./clientTypeDefs";
import {BrowserRouter} from "react-router-dom";
import './favicon.ico';

const fragmentMatcher = new IntrospectionFragmentMatcher({
	introspectionQueryResultData: {
		__schema: {
			types: [],
		},
	}
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
			mapWikiVisibility: false,
			pinBeingEdited: null,
			mapWiki: null,
		}
	}
);

const client = new ApolloClient({
	link: createUploadLink({
		uri: '/api',
		credentials: 'same-origin',
	}),
	cache: cache,
	typeDefs: clientTypeDefs,
	resolvers: clientResolvers,
	connectToDevTools: true
});

ReactDOM.render(<BrowserRouter> <ApolloProvider client={client}><App/></ApolloProvider></BrowserRouter>, document.getElementById('app'));
