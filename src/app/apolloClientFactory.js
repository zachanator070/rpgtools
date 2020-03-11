import {InMemoryCache, IntrospectionFragmentMatcher} from "apollo-cache-inmemory";
import {ApolloClient} from "apollo-client";
import {createUploadLink} from "apollo-upload-client";
import {clientTypeDefs} from "./clientTypeDefs";
import {clientResolvers} from "./clientResolvers";

export const makeClient = () => {
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
				permissionModalVisibility: false,
				mapWikiVisibility: false,
				pinBeingEdited: null,
				mapWiki: null,
			}
		}
	);

	return new ApolloClient({
		link: createUploadLink({
			uri: '/api',
			credentials: 'same-origin',
		}),
		cache: cache,
		typeDefs: clientTypeDefs,
		resolvers: clientResolvers,
		connectToDevTools: true
	});
};