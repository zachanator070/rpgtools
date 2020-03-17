import gql from "graphql-tag";

export const clientTypeDefs = gql`

    extend type Query{
		loginModalVisibility: Boolean!
		registerModalVisibility: Boolean!
		createWorldModalVisibility: Boolean!
		selectWorldModalVisibility: Boolean!
		worldPermissionModalVisibility: Boolean!
		permissionModalVisibility: Boolean!
		editPinModalVisibility: Boolean!
		mapWikiVisibility: Boolean!
		
		permissionEditorSubject: PermissionControlled!
		permissionEditorSubjectType: String!
		
		pinBeingEdited: ID
		mapWiki: ID
    }
    
    extend type Mutation{
        setCreateWorldModalVisibility(visibility: Boolean!): Boolean!
        setLoginModalVisibility(visibility: Boolean!): Boolean!
        setRegisterModalVisibility(visibility: Boolean!): Boolean!
        setSelectWorldModalVisibility(visibility: Boolean!): Boolean!
        setWorldPermissionModalVisibility(visibility: Boolean!): Boolean!
        setEditPinModalVisibility(visibility: Boolean!): Boolean!
        setMapWikiVisibility(visibility: Boolean!): Boolean!
        
        setPinBeingEdited(pinId: ID!): ID
        setMapWiki(mapWikiId: ID!): ID
        
        setPermissionEditorSubjectType(subjectType: String!): String!
        setPermissionEditorSubject(subject: PermissionControlled!): PermissionControlled!
    }
    
`;