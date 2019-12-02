import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import {ApolloClient} from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import {ApolloProvider} from "@apollo/react-common";
import Resolvers from "./local-resolvers";
import gql from "graphql-tag";

const typeDefs = gql`

    type ModalVisibility{
        showLoginModal: Boolean!
        showRegisterModal: Boolean!
        showWorldCreateModal: Boolean!
        showWorldSelectModal: Boolean!
        showWorldPermissionsModal: Boolean!
    }

    extend type Query{
        currentWorld: World
        currentWiki: WikiPage
        
        modalVisibility: ModalVisibility
        
    }
    
    extend type Mutation{
        setCurrentUser(id: ID!): Boolean!
        setCurrentWorld(id: ID): Boolean!
    }
    
`;

const cache = new InMemoryCache();
cache.writeData(
	{
		data: {
			currentWorld: null,
			currentWiki: null,
			modalVisibility: {
				__typename: 'ModalVisibility',
				_id: 1,
				showLoginModal: false,
				showRegisterModal: false,
				showWorldCreateModal: false,
				showWorldSelectModal: false,
				showWorldPermissionsModal: false,
			}
		}
	}
);

const client = new ApolloClient({
	link: new HttpLink({
		uri: '/api',
		credentials: 'same-origin',
	}),
	cache: cache,
	typeDefs,
	resolvers: Resolvers,
	connectToDevTools: true
});

ReactDOM.render(<> <ApolloProvider client={client}><App/></ApolloProvider></>, document.getElementById('app'));