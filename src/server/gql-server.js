import { ApolloServer,  gql } from 'apollo-server-express';
import { authenticated } from './auth-helpers.js';
import MutationResolver from './resolvers/mutation';
import QueryResolver from './resolvers/query';
import jwt from 'jsonwebtoken';
import User from './models/user';

const HEADER_NAME = 'authorization';

const typeDefs = gql`
  type Query {
     me: User
     serverTime: String
  }
  type Mutation{
    login(username: String!, password:  String!): String!
    register(email: String!, username: String!, password: String!): User!
  }
  type User {
     _id: ID!
     username: String!
     email: String!
  }
`;

const resolvers = {
    Query: QueryResolver,
    Mutation: MutationResolver,
    User: {
        _id: user => user._id,
        username: user => user.username,
        email: user => user.email,
    },
};

export default new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, res }) => {
        let accessToken = null;
        let refreshToken = null;
        let currentUser = null;

        try {
            accessToken = req.cookies.accessToken;
            refreshToken = req.cookies.refreshToken;

            if (accessToken && refreshToken) {
                accessToken = jwt.decode(accessToken);
                refreshToken = jwt.decode(refreshToken);
                currentUser = await User.findOne({_id: accessToken.userId});
            }
        } catch (e) {
            console.warn(`Unable to authenticate using auth token: ${authToken}`);
        }

        return {
            res,
            accessToken,
            refreshToken,
            currentUser,
        };
    },
});