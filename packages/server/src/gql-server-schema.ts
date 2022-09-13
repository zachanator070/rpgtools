import gql from "graphql-tag";

export const typeDefs = gql`
	type Query {
		currentUser: User

		serverConfig: ServerConfig!

		"""
		Get a world by id
		"""
		world(worldId: ID): World
		"""
		Get all worlds
		"""
		worlds(name: String, page: Int): WorldPaginatedResult

		"""
		Get a wiki by id
		"""
		wiki(wikiId: ID!): WikiPage
		"""
		Get all wikis that are in a set of folders
		"""
		wikisInFolder(folderId: ID!, page: Int): WikiPagePaginatedResult!
        wikis(worldId: ID, name: String, types: [String!], canAdmin: Boolean, hasModel: Boolean, page: Int): WikiPagePaginatedResult!
		"""
		Get all wiki folders for a world
		"""
		folders(worldId: ID!, name: String, canAdmin: Boolean, page: Int): [WikiFolder!]!
		"""
		Get a path to the root folder for a wiki page
		"""
		getFolderPath(wikiId: ID!): [WikiFolder!]!

		"""
		Search for users by username
		"""
		users(username: String!): UserPaginatedResult!

		"""
		Search for roles by name
		"""
		roles(worldId: ID, name: String, canAdmin: Boolean, page: Int): RolePaginatedResult!

		"""
		Get a game by id
		"""
		game(gameId: ID!): Game!

		"""
		Get all games that the current user is a part of
		"""
		myGames: [Game!]!

		"""
		Get all models for a world
		"""
		models(worldId: ID!): [Model!]!
		
		pins(worldId: ID!, page: Int): PinPaginatedResult!
	}

	type Mutation {
		unlockServer(unlockCode: String!, email: String!, username: String!, password: String!): Boolean
		generateRegisterCodes(amount: Int!): ServerConfig!

		login(username: String!, password: String!): User!
		logout: String!
		register(registerCode: String!, email: String!, username: String!, password: String!): User!
		setCurrentWorld(worldId: ID!): User!

		createWorld(name: String!, public: Boolean!): World!
		renameWorld(worldId: ID!, newName: String!): World!
		load5eContent(worldId: ID!, creatureCodex: Boolean, tomeOfBeasts: Boolean): World!

		createRole(worldId: ID!, name: String!): Role!
		deleteRole(roleId: ID!): Role!
		addUserRole(userId: ID!, roleId: ID!): Role!
		removeUserRole(userId: ID!, roleId: ID!): Role!

		grantUserPermission(
			userId: ID!
			permission: String!
			subjectId: ID!
			subjectType: String!
		): PermissionControlled!
		revokeUserPermission(userId: ID!, permission: String!, subjectId: ID!, subjectType: String!): PermissionControlled!
		grantRolePermission(
			roleId: ID!
			permission: String!
			subjectId: ID!
			subjectType: String!
		): Role!
		revokeRolePermission(roleId: ID!, permission: String!, subjectId: ID!, subjectType: String!): Role!

		createFolder(name: String!, parentFolderId: ID!): WikiFolder!
		renameFolder(folderId: ID!, name: String!): WikiFolder!
		deleteFolder(folderId: ID!): WikiFolder!
		moveFolder(folderId: ID!, parentFolderId: ID!): WikiFolder!
		importContent(folderId: ID!, zipFile: Upload!): WikiFolder!

		createWiki(name: String!, folderId: ID!): WikiFolder!
		deleteWiki(wikiId: ID!): WikiFolder!
		updateWiki(
			wikiId: ID!
			name: String
			content: Upload
			coverImageId: ID
			type: String
		): WikiPage!
		updatePlace(placeId: ID!, mapImageId: ID, pixelsPerFoot: Int): Place!
		updateModeledWiki(wikiId: ID!, model: ID, color: String): WikiPage!
		moveWiki(wikiId: ID!, folderId: ID!): WikiPage!

		createImage(file: Upload!, worldId: ID!, chunkify: Boolean): Image!

		createPin(mapId: ID!, x: Float!, y: Float!, wikiId: ID): Pin!
		updatePin(pinId: ID!, pageId: ID): Pin!
		deletePin(pinId: ID!): Pin!

		createGame(worldId: ID!, password: String, characterName: String): Game!
		joinGame(gameId: ID!, password: String, characterName: String): Game!
		leaveGame(gameId: ID!): Boolean!
		gameChat(gameId: ID!, message: String!): Game!
		setCharacterAttributes(
			gameId: ID!
			attributes: [CharacterAttributeInput!]!
		): Game!
		setGameMap(gameId: ID!, placeId: ID!, clearPaint: Boolean, setFog: Boolean): Game!
		addStroke(
			gameId: ID!
			path: [PathNodeInput!]!
			type: String!
			size: Int!
			color: String!
			fill: Boolean!
			strokeId: ID!
		): Game!
		addFogStroke(
			gameId: ID!
			path: [PathNodeInput!]!
			type: String!
			size: Int!
			strokeId: ID!
		): Game!
		addModel(gameId: ID!, modelId: ID!, wikiId: ID, color: String): Game!
		setModelPosition(
			gameId: ID!
			positionedModelId: ID!
			x: Float!
			z: Float
			lookAtX: Float!
			lookAtZ: Float!
		): PositionedModel!
		setModelColor(gameId: ID!, positionedModelId: ID!, color: String): PositionedModel!
		setPositionedModelWiki(gameId: ID!, positionedModelId: ID!, wikiId: ID): PositionedModel!
		deletePositionedModel(gameId: ID!, positionedModelId: ID!): Game!
		setCharacterOrder(gameId: ID!, characters: [CharacterInput!]!): Game!

		createModel(
			name: String!
			file: Upload!
			worldId: ID!
			depth: Float!
			width: Float!
			height: Float!
			notes: String
		): Model!
		updateModel(
			modelId: ID!
			name: String!
			file: Upload
			depth: Float!
			width: Float!
			height: Float!
			notes: String
		): Model!
		deleteModel(modelId: ID!): Model!
	}

	type Subscription {
		gameChat(gameId: ID!): GameMessage!
		gameRosterChange(gameId: ID!): Game!
		gameMapChange(gameId: ID!): Game!
		gameStrokeAdded(gameId: ID!): Stroke!
		gameFogStrokeAdded(gameId: ID!): FogStroke!
		gameModelAdded(gameId: ID!): PositionedModel!
		gameModelDeleted(gameId: ID!): PositionedModel!
		gameModelPositioned(gameId: ID!): PositionedModel!
	}

	type User {
		_id: ID
		username: String!
		email: String
		currentWorld: World
		roles: [Role!]!
	}

	interface PermissionControlled {
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
		_id: ID!
	}

	type World implements PermissionControlled {
		_id: ID!
		name: String!
		wikiPage: Place
		rootFolder: WikiFolder
		pins: [Pin!]!
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
		canAddRoles: Boolean!
		canHostGame: Boolean!
		canAddModels: Boolean!
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
		docs: [WikiPage!]!
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
	
	type PinPaginatedResult {
	    docs: [Pin!]!
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
		folder: WikiFolder!
	}

	interface ModeledWiki {
		model: Model
		modelColor: String
	}

	type Article implements WikiPage & PermissionControlled {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		type: String!
		folder: WikiFolder!
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
	}

	type Place implements WikiPage & PermissionControlled {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		mapImage: Image
		pixelsPerFoot: Int
		type: String!
		folder: WikiFolder!
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
	}

	type Person implements WikiPage & PermissionControlled & ModeledWiki {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		type: String!
		folder: WikiFolder!
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
		model: Model
		modelColor: String
	}

	type Item implements WikiPage & PermissionControlled & ModeledWiki {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		type: String!
		folder: WikiFolder!
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
		model: Model
		modelColor: String
	}

	type Monster implements WikiPage & PermissionControlled & ModeledWiki {
		_id: ID!
		name: String!
		content: String
		world: World!
		coverImage: Image
		type: String!
		folder: WikiFolder!
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
		model: Model
		modelColor: String
	}

	type WikiFolder implements PermissionControlled {
		_id: ID!
		name: String!
		world: World!
		children: [WikiFolder!]!
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
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

	type Role implements PermissionControlled {
		_id: ID!
		name: String!
		accessControlList: [AclEntry!]!
		members: [User!]!
		world: World
		permissions: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
	}

    union AclPrincipal = User | Role

	type AclEntry {
		_id: ID!
		permission: String!
		principal: AclPrincipal!
		principalType: String!
	}

	type Pin {
		_id: ID!
		map: Place!
		x: Float!
		y: Float!
		page: WikiPage
		canWrite: Boolean!
	}

	type ServerConfig implements PermissionControlled {
		_id: ID!
		version: String!
		registerCodes: [String!]!
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
		canCreateWorlds: Boolean!
		roles: [Role!]!
	}

	type GameMessage {
		sender: String!
		receiver: String!
		message: String!
		timestamp: String!
	}

	type Game implements PermissionControlled {
		_id: ID!
		world: World!
		map: Place
		characters: [GameCharacter!]!
		messages: [GameMessage!]!
		host: User!
		accessControlList: [AclEntry!]!
		canPaint: Boolean!
		canModel: Boolean!
		canWriteFog: Boolean!
		canWrite: Boolean!
		canAdmin: Boolean!
		strokes: [Stroke!]!
		fog: [FogStroke!]!
		models: [PositionedModel!]!
	}

	type GameCharacter {
	    _id: ID!
		name: String
		player: User!
		color: String!
		attributes: [GameCharacterAttribute!]!
	}
	
	type GameCharacterAttribute {
	    _id: ID!
	    name: String!
	    value: Int!
    }

    input CharacterAttributeInput {
        _id: ID
	    name: String!
	    value: Int!
    }

	input CharacterInput {
		name: String
	}

	type Stroke {
		_id: String
		path: [PathNode!]!
		type: String!
		size: Int!
		color: String!
		fill: Boolean!
	}

	type FogStroke {
		_id: String
		path: [PathNode!]!
		type: String!
		size: Int!
	}

	type PathNode {
		x: Float!
		y: Float!
		_id: String
	}

	input PathNodeInput {
		x: Float!
		y: Float!
		_id: String
	}

	type Model implements PermissionControlled {
		_id: ID!
		name: String!
		depth: Float!
		width: Float!
		height: Float!
		fileName: String!
		fileId: ID!
		notes: String
		accessControlList: [AclEntry!]!
		canWrite: Boolean!
		canAdmin: Boolean!
	}

	type PositionedModel {
		_id: ID!
		model: Model!
		x: Float!
		z: Float!
		lookAtX: Float!
		lookAtZ: Float!
		color: String
		wiki: WikiPage
	}

	scalar Upload
`;
