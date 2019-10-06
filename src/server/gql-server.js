import { ApolloServer,  gql } from 'apollo-server-express';
import { tradeTokenForUser, authenticated } from './auth-helpers.js';

const HEADER_NAME = 'authorization';

const typeDefs = gql`
  type Query {
     me: User
     serverTime: String
  }
  type User {
     id: ID!
     username: String!
  }
`;

const resolvers = {
    Query: {
        me: authenticated((root, args, context) => context.currentUser),
        serverTime: () => new Date(),
    },
    User: {
        id: user => user._id,
        username: user => user.username,
    },
};

export default new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        let authToken = null;
        let currentUser = null;

        try {
            authToken = req.headers[HEADER_NAME];

            if (authToken) {
                currentUser = await tradeTokenForUser(authToken);
            }
        } catch (e) {
            console.warn(`Unable to authenticate using auth token: ${authToken}`);
        }

        return {
            authToken,
            currentUser,
        };
    },
});