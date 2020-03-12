import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {ApolloProvider} from "@apollo/react-common";
import {BrowserRouter} from "react-router-dom";
import './favicon.ico';
import {getIntrospectionData} from "./components/get-introspection-data";
import {InMemoryCache, IntrospectionFragmentMatcher} from "apollo-cache-inmemory";
import {ApolloClient} from "apollo-client";
import {createUploadLink} from "apollo-upload-client";
import {clientTypeDefs} from "./clientTypeDefs";
import {clientResolvers} from "./clientResolvers";

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
});
