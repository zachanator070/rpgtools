import gql from "graphql-tag";

export const typeDefs = gql`

    type Query {
        """
        Get the current logged in user
        """
        currentUser: User
        """
        Search for a world by id or name.
        """
        world(worldId: ID, name: String): World
        """
        Get all worlds
        """
        worlds(page: Int): WorldsPaginatedResult
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
  
    type Mutation{
        login(username: String!, password:  String!): User!
        logout: String!
        register(email: String!, username: String!, password: String!): User!
        invalidateTokens: Boolean!
        createWorld(name: String!, public: Boolean!): World!
    }
  
    type User {
        _id: ID!
        username: String!
        email: String!
        currentWorld: World
        roles: [Role!]!
        permissions: [Permission!]!
    }
  
	type World {
		_id: ID!
		name: String!
		wikiPage: Place!
		rootFolder: WikiFolder!
		roles: [Role!]!
	}
	
	interface WikiPage {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		public: Boolean!
	}
	
	type Place implements WikiPage {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		mapImage: Image
		public: Boolean!
	}
	
	type Person implements WikiPage {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		public: Boolean!
	}
	
	type WikiFolder {
		_id: ID!
		name: String!
		public: Boolean!
		world: World!
		pages: [WikiPage!]!
		children: [WikiFolder!]!
	}
	
	type Image {
		_id: ID!
		world: World!
		height: Int!
		width: Int!
		chunkHeight: Int!
		chunkWidth: Int!
		chunks: [Chunk!]!
		Icon: Image!
	}
	
	type Chunk {
		_id: ID!
		image: Image!
		x: Int!
		y: Int!
		width: Int!
		height: Int!
	}
	
	type Role {
		_id: ID!
		name: String!
		permissions: [Permission!]!
	}
	
	type Permission {
		permission: String!
		subject: ID
	}

`;