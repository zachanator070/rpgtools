import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {ApolloClient} from "apollo-client";
import {createUploadLink} from 'apollo-upload-client'
import {InMemoryCache} from "apollo-cache-inmemory";
import {ApolloProvider} from "@apollo/react-common";
import {clientResolvers} from "./clientResolvers";
import {clientTypeDefs} from "./clientTypeDefs";
import {BrowserRouter} from "react-router-dom";

const cache = new InMemoryCache();
cache.writeData(
	{
		data: {
			currentWorld: null,
			currentWiki: null,
			loginModalVisibility: false,
			registerModalVisibility: false,
			createWorldModalVisibility: false,
			selectWorldModalVisibility: false,
			worldPermissionModalVisibility: false,
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