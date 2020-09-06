import gql from "graphql-tag";

export const clientTypeDefs = gql`

    extend type Query{
		mapWiki: ID
    }
    
    extend type Mutation{
        setMapWiki(mapWikiId: ID!): ID
    }
    
`;