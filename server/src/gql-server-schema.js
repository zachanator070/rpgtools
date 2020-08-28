import gql from "graphql-tag";

export const typeDefs = gql`

    type Query {
        currentUser: User
        
        serverConfig: ServerConfig!
        
        """Get a world by id"""
        world(worldId: ID): World
        """Get all worlds"""
        worlds(page: Int): WorldPaginatedResult
        
        """Get a wiki by id"""
        wiki(wikiId: ID!): WikiPage
        """Search for a wiki page by name"""
        wikis(worldId: ID!, name: String!, type: String): WikiPagePaginatedResult!
        
        """Search for users by username"""
        users(username: String!): UserPaginatedResult!
        
        """Search for roles by name"""
        roles(worldId: ID!, name: String!): RolePaginatedResult!
        
        """Get a game by id"""
        game(gameId: ID!): Game!
    }
  
    type Mutation{
        unlockServer(unlockCode: String!, email: String!, username: String!, password: String!): Boolean
        generateRegisterCodes(amount: Int!): ServerConfig!
        
        login(username: String!, password:  String!): User!
        logout: String!
        register(registerCode: String!, email: String!, username: String!, password: String!): User!
        setCurrentWorld(worldId: ID!): User!
        
        createWorld(name: String!, public: Boolean!): World!
        renameWorld(worldId: ID!, newName: String!): World!
        
        createRole(worldId: ID!, name: String!): World!
        deleteRole(roleId: ID!): World!
        addUserRole(userId: ID!, roleId: ID!): World!
        removeUserRole(userId: ID!, roleId: ID!): World!
        
        """ Grant a permission to a user """
        grantUserPermission(userId: ID!, permission: String!, subjectId: ID!, subjectType: String!): PermissionControlled!
        """ Revoke a assigned permission from a user """
        revokeUserPermission(userId: ID!, permissionAssignmentId: ID!): PermissionControlled!
        """ Grant a permission to a role """
        grantRolePermission(roleId: ID!, permission: String!, subjectId: ID!, subjectType: String!): Role!
        """ Revoke a permission from a role """
        revokeRolePermission(roleId: ID!, permissionAssignmentId: ID!): Role!
        
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
        
        createPin(mapId: ID!, x: Float!, y: Float!, wikiId: ID): World!
        updatePin(pinId: ID!, pageId: ID): World!
        deletePin(pinId: ID!): World!
        
        createGame(worldId: ID!, password: String): Game!
        joinGame(gameId: ID!, password: String): Game!
        gameChat(gameId: ID!, message: String!): Game!
    }
  
    type User {
        _id: ID!
        username: String!
        email: String
        currentWorld: World
        roles: [Role!]!
        permissions: [PermissionAssignment!]!
    }
  
    interface PermissionControlled {
        usersWithPermissions: [User!]!
        _id: ID!
    }
  
	type World implements PermissionControlled {
		_id: ID!
		name: String!
		wikiPage: Place
		rootFolder: WikiFolder
		roles: [Role!]!
		usersWithPermissions: [User!]!
		pins: [Pin!]!
		folders: [WikiFolder!]!
		canWrite: Boolean!
		canAddRoles: Boolean!
		canHostGame: Boolean!
	}
	
	type WorldPaginatedResult {
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
    
    type UserPaginatedResult {
        docs: [User!]!
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
    
    type RolePaginatedResult {
        docs: [Role!]!
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
    
    type WikiPagePaginatedResult {
        docs: [Role!]!
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
		usersWithPermissions: [User!]!
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
		usersWithPermissions: [User!]!
	}
	
	type Person implements WikiPage & PermissionControlled {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		type: String!
		canWrite: Boolean!
		usersWithPermissions: [User!]!
	}
	
	type WikiFolder implements PermissionControlled{
		_id: ID!
		name: String!
		world: World!
		pages: [WikiPage!]!
		children: [WikiFolder!]!
		canWrite: Boolean!
		usersWithPermissions: [User!]!
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
	
	type Role implements PermissionControlled{
		_id: ID!
		name: String!
		permissions: [PermissionAssignment!]!
		members: [User!]!
		world: World!
		canWrite: Boolean!
		usersWithPermissions: [User!]!
	}
	
	type PermissionAssignment {
		_id: ID!
		permission: String!
		subject: PermissionControlled!
		subjectType: String!
		canWrite: Boolean!
	}
	
	type Pin {
		_id: ID!
		map: Place!
		x: Float!
		y: Float!
		page: WikiPage
		canWrite: Boolean!
	}
	
	type ServerConfig {
		_id: ID!
		version: String!
		registerCodes: [String!]!
		adminUsers: [User!]!
	}
	
	type GameMessage {
		sender: String!
		message: String!
		timestamp: String!
	}
	
	type Game {
		_id: ID!
		world: World!
		map: Place!
		players: [User!]!
		messages: [GameMessage!]!
		canWrite: Boolean!
	}
`;