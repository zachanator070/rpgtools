import gql from "graphql-tag";

export const clientTypeDefs = gql`

    extend type Query{
		mapWikiVisibility: Boolean!
		mapWiki: ID
    }
    
    extend type Mutation{
        setMapWikiVisibility(visibility: Boolean!): Boolean!
        setMapWiki(mapWikiId: ID!): ID
    }
    
`;