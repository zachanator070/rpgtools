import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {ApolloProvider} from "@apollo/react-common";
import {BrowserRouter} from "react-router-dom";
import './favicon.ico';
import {makeClient} from "./apolloClientFactory";

const client = makeClient();

ReactDOM.render(<BrowserRouter> <ApolloProvider client={client}><App/></ApolloProvider></BrowserRouter>, document.getElementById('app'));
