import gql from "graphql-tag";

export const clientTypeDefs = gql`

    extend type Query{
		loginModalVisibility: Boolean!
		registerModalVisibility: Boolean!
		createWorldModalVisibility: Boolean!
		selectWorldModalVisibility: Boolean!
		worldPermissionModalVisibility: Boolean!
    }
    
    extend type Mutation{
        setCreateWorldModalVisibility(visibility: Boolean!): Boolean!
        setLoginModalVisibility(visibility: Boolean!): Boolean!
        setRegisterModalVisibility(visibility: Boolean!): Boolean!
        setSelectWorldModalVisibility(visibility: Boolean!): Boolean!
        setWorldPermissionModalVisibility(visibility: Boolean!): Boolean!
    }
    
`;