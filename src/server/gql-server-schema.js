import gql from "graphql-tag";

export const typeDefs = gql`

    type Query {
        currentUser: User
        
        """Search for a world by id or name."""
        world(worldId: ID, name: String): World
        """Get all worlds"""
        worlds(page: Int): WorldsPaginatedResult
        
        """Search for a wiki page using a phrase"""
        searchWikiPages(phrase: String!, worldId: ID!): [WikiPage!]!
        """Search for a wiki by id"""
        wiki(wikiId: ID!): WikiPage
        """Search for users by username"""
        users(username: String!): [User!]!
        """Search for roles by name"""
        roles(name: String!): [Role!]!
    }
  
    type Mutation{
        login(username: String!, password:  String!): User!
        logout: String!
        register(email: String!, username: String!, password: String!): User!
        setCurrentWorld(worldId: ID!): User!
        
        createWorld(name: String!, public: Boolean!): World!
        renameWorld(worldId: ID!, newName: String!): World!
        
        createRole(worldId: ID!, name: String!): World!
        deleteRole(roleId: ID!): World!
        
        """ Grant a permission to a user """
        grantUserPermission(userId: ID!, permission: String!, subjectId: ID): PermissionControlled!
        """ Revoke a assigned permission from a user """        
        revokeUserPermission(userId: ID!, permission: String!, subjectId: ID): PermissionControlled!
        """ Grant a permission to a role """
        grantRolePermission(roleId: ID!, permission: String!, subjectId: ID): PermissionControlled!
        """ Revoke a permission from a role """
        revokeRolePermission(roleId: ID!, permission: String!, subjectId: ID): PermissionControlled!
        
        createFolder(name: String!, parentFolderId: ID!): World!
        renameFolder(folderId: ID!, name: String!): WikiFolder!
        deleteFolder(folderId: ID!): World!
        
        """ Creates a generic wiki page """
        createWiki(name: String!, folderId: ID!): World!
        """ Deletes any wiki page of any type """
        deleteWiki(wikiId: ID!): World!
        """ Updates any wiki page of any type """
        updateWiki(wikiId: ID!, name: String, content: Upload, coverImageId: ID, type: String): WikiPage!
        """ Update place specific attributes """
        updatePlace(placeId: ID!, mapImageId: ID): Place!
        
        createImage(file: Upload!, worldId: ID!, chunkify: Boolean): Image!
        
        createPin(mapId: ID!, x: Float!, y: Float!, wikiId: ID): Pin!
        updatePin(pinId: ID!, pageId: ID): Pin!
        deletePin(pinId: ID!): Pin!
        
    }
  
    type User {
        _id: ID!
        username: String!
        email: String!
        currentWorld: World
        roles: [Role!]!
        permissions: [PermissionAssignment!]!
    }
  
    interface PermissionControlled {
        _id: ID!
        userPermissionAssignments: [userPermissionAssignment!]!
		rolePermissionAssignments: [rolePermissionAssignment!]!
    }
  
	type World implements PermissionControlled {
		_id: ID!
		name: String!
		wikiPage: Place
		rootFolder: WikiFolder
		roles: [Role!]!
		pins: [Pin!]!
		folders: [WikiFolder!]!
		canWrite: Boolean!
		userPermissionAssignments: [userPermissionAssignment!]!
		rolePermissionAssignments: [rolePermissionAssignment!]!
		canAddRoles: Boolean!
	}
	
	type WorldsPaginatedResult {
        docs: [World!]!
        totalDocs: Int!
        limit: Int!
        page: Int!
        totalPages: Int!
        pagingCounter: Int!
        hasPrevPage: Boolean!
        hasNextPage: Boolean!
        prevPage: Int
        nextPage: Int
    }
	
	interface WikiPage {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		type: String!
		canWrite: Boolean!
	}
	
	type Article implements WikiPage & PermissionControlled {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		type: String!
		canWrite: Boolean!
		userPermissionAssignments: [userPermissionAssignment!]!
		rolePermissionAssignments: [rolePermissionAssignment!]!
	}
	
	type Place implements WikiPage & PermissionControlled {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		mapImage: Image
		type: String!
		canWrite: Boolean!
		userPermissionAssignments: [userPermissionAssignment!]!
		rolePermissionAssignments: [rolePermissionAssignment!]!
	}
	
	type Person implements WikiPage & PermissionControlled {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		type: String!
		canWrite: Boolean!
		userPermissionAssignments: [userPermissionAssignment!]!
		rolePermissionAssignments: [rolePermissionAssignment!]!
	}
	
	type WikiFolder {
		_id: ID!
		name: String!
		world: World!
		pages: [WikiPage!]!
		children: [WikiFolder!]!
		canWrite: Boolean!
	}
	
	type Image {
		_id: ID!
		world: World!
		height: Int!
		width: Int!
		chunkHeight: Int!
		chunkWidth: Int!
		chunks: [Chunk!]!
		icon: Image!
		canWrite: Boolean!
		name: String!
	}
	
	type Chunk {
		_id: ID!
		image: Image!
		x: Int!
		y: Int!
		width: Int!
		height: Int!
		fileId: ID!
	}
	
	type Role {
		_id: ID!
		name: String!
		permissions: [PermissionAssignment!]!
		members: [User!]!
		world: World!
		canWrite: Boolean!
	}
	
	type PermissionAssignment {
		_id: ID!
		permission: String!
		subjectId: ID
		subjectType: String!
	}
	
	type Pin {
		_id: ID!
		map: Place!
		x: Float!
		y: Float!
		page: WikiPage
		canWrite: Boolean!
	}
	
	type userPermissionAssignment {
		permission: String!
		subjectId: ID!
		user: User!
	}

	type rolePermissionAssignment {
		permission: String!
		subjectId: ID!
		role: Role!
	}
`;