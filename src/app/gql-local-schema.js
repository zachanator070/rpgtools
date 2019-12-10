import gql from "graphql-tag";

export const typeDefs = gql`

    extend type Query{
        # currentWiki, currentWorld, current* are not stored in the currentUser object b/c for most of these a user
        #  is not required to be logged in to view them
        currentWiki: WikiPage
        currentWorld: World
        
		loginModalVisibility: Boolean!
		registerModalVisibility: Boolean!
		createWorldModalVisibility: Boolean!
		selectWorldModalVisibility: Boolean!
		worldPermissionModalVisibility: Boolean!
    }
    
    extend type Mutation{
        setCurrentWorld(worldId: ID!): World!
        setCurrentWiki(wikiId: ID!): WikiPage!
        
        setCreateWorldModalVisibility(visibility: Boolean!): Boolean!
        setLoginModalVisibility(visibility: Boolean!): Boolean!
        setRegisterModalVisibility(visibility: Boolean!): Boolean!
        setSelectWorldModalVisibility(visibility: Boolean!): Boolean!
        setWorldPermissionModalVisibility(visibility: Boolean!): Boolean!
    }
    
`;