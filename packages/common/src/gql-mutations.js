"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPSERT_CALENDAR = exports.RENAME_WORLD = exports.CREATE_WORLD = exports.UPDATE_EVENT = exports.UPDATE_WIKI = exports.UPDATE_PLACE = exports.UPDATE_MODELED_WIKI = exports.MOVE_WIKI = exports.DELETE_WIKI = exports.CREATE_WIKI = exports.CREATE_IMAGE = exports.RENAME_FOLDER = exports.MOVE_FOLDER = exports.DELETE_FOLDER = exports.CREATE_FOLDER = exports.SET_DEFAULT_WORLD = exports.UNLOCK_SERVER = exports.GENERATE_REGISTER_CODES = exports.UPDATE_MODEL = exports.DELETE_MODEL = exports.CREATE_MODEL = exports.UPDATE_PIN = exports.DELETE_PIN = exports.CREATE_PIN = exports.SET_GAME_MAP = exports.SET_CHARACTER_ORDER = exports.SET_CHARACTER_ATTRIBUTES = exports.GAME_CHAT = exports.ADD_STROKE = exports.ADD_FOG_STROKE = exports.SET_POSITIONED_MODEL_WIKI = exports.SET_MODEL_POSITION = exports.SET_MODEL_COLOR = exports.DELETE_POSITIONED_MODEL = exports.ADD_MODEL = exports.LEAVE_GAME = exports.JOIN_GAME = exports.CREATE_GAME = exports.REVOKE_USER_PERMISSION = exports.GRANT_USER_PERMISSION = exports.SET_CURRENT_WORLD = exports.REGISTER_MUTATION = exports.REVOKE_ROLE_PERMISSION = exports.GRANT_ROLE_PERMISSION = exports.REMOVE_USER_ROLE = exports.ADD_USER_ROLE = exports.DELETE_ROLE = exports.CREATE_ROLE = exports.LOGOUT_QUERY = exports.LOGIN_QUERY = void 0;
exports.LOAD_5E_CONTENT = exports.IMPORT_CONTENT = exports.DELETE_CALENDAR = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const gql_fragments_1 = require("./gql-fragments");
//region Authentication
exports.LOGIN_QUERY = (0, graphql_tag_1.default) `
	mutation login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			_id
		}
	}
`;
exports.LOGOUT_QUERY = (0, graphql_tag_1.default) `
	mutation logout{
		logout
	}
`;
//endregion
//region Role
exports.CREATE_ROLE = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_ROLES}
	mutation createRole($worldId: ID!, $name: String!){
		createRole(worldId: $worldId, name: $name){
			_id
			...currentWorldRoles
		}
	}
`;
exports.DELETE_ROLE = (0, graphql_tag_1.default) `
	mutation deleteRole($roleId: ID!) {
		deleteRole(roleId: $roleId) {
			_id
		}
	}
`;
exports.ADD_USER_ROLE = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_ROLES}
	mutation addUserRole($userId: ID!, $roleId: ID!){
		addUserRole(userId: $userId, roleId: $roleId){
			_id
			...currentWorldRoles		
		}
	}
`;
exports.REMOVE_USER_ROLE = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_ROLES}
	mutation removeUserRole($userId: ID!, $roleId: ID!){
		removeUserRole(userId: $userId, roleId: $roleId){
			_id
			...currentWorldRoles
		}
	}
`;
exports.GRANT_ROLE_PERMISSION = (0, graphql_tag_1.default) `
	mutation grantRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
		}
	}
`;
exports.REVOKE_ROLE_PERMISSION = (0, graphql_tag_1.default) `
	mutation revokeRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		revokeRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
		}
	}
`;
//endregion
//region User
exports.REGISTER_MUTATION = (0, graphql_tag_1.default) `
	mutation register(
		$registerCode: String!
		$email: String!
		$username: String!
		$password: String!
	) {
		register(
			registerCode: $registerCode
			email: $email
			username: $username
			password: $password
		) {
			_id
		}
	}
`;
exports.SET_CURRENT_WORLD = (0, graphql_tag_1.default) `
	mutation setCurrentWorld($worldId: ID!) {
		setCurrentWorld(worldId: $worldId) {
			_id
		}
	}
`;
exports.GRANT_USER_PERMISSION = (0, graphql_tag_1.default) `
	${gql_fragments_1.ACCESS_CONTROL_LIST}
	mutation grantUserPermission($userId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			...accessControlList		
		}
	}
`;
exports.REVOKE_USER_PERMISSION = (0, graphql_tag_1.default) `
	${gql_fragments_1.ACCESS_CONTROL_LIST}
	mutation revokeUserPermission($userId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		revokeUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			...accessControlList
		}
	}
`;
//endregion
//region Game
exports.CREATE_GAME = (0, graphql_tag_1.default) `
	${gql_fragments_1.ACCESS_CONTROL_LIST}
	mutation createGame($worldId: ID!, $password: String, $characterName: String){
		createGame(worldId: $worldId, password: $password, characterName: $characterName){
			_id
			...accessControlList
		}
	}
`;
exports.JOIN_GAME = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_ATTRIBUTES}
	mutation joinGame($gameId: ID!, $password: String, $characterName: String){
		joinGame(gameId: $gameId, password: $password, characterName: $characterName){
			...gameAttributes
		}
	}
`;
exports.LEAVE_GAME = (0, graphql_tag_1.default) `
	mutation leaveGame($gameId: ID!) {
		leaveGame(gameId: $gameId)
	}
`;
exports.ADD_MODEL = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_MODELS}
	mutation addModel($gameId: ID!, $modelId: ID!, $wikiId: ID, $color: String){
		addModel(gameId: $gameId, modelId: $modelId, wikiId: $wikiId, color: $color){
			_id
			...gameModels
		}
	}	
`;
exports.DELETE_POSITIONED_MODEL = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_MODELS}
	mutation deletePositionedModel($gameId: ID!, $positionedModelId: ID!){
		deletePositionedModel(gameId: $gameId, positionedModelId: $positionedModelId){
			_id
			...gameModels		
		}
	}	
`;
exports.SET_MODEL_COLOR = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_MODEL}
	mutation setModelColor($gameId: ID!, $positionedModelId: ID!, $color: String){
		setModelColor(gameId: $gameId, positionedModelId: $positionedModelId, color: $color){
			...gameModel
		}
	}
`;
exports.SET_MODEL_POSITION = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_MODEL}
	mutation setModelPosition($gameId: ID!, $positionedModelId: ID!, $x: Float!, $z: Float!, $lookAtX: Float!, $lookAtZ: Float!){
		setModelPosition(gameId: $gameId, positionedModelId: $positionedModelId, x: $x, z: $z, lookAtX: $lookAtX, lookAtZ: $lookAtZ){
			...gameModel
		}
	}
`;
exports.SET_POSITIONED_MODEL_WIKI = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_MODEL}
	mutation setPositionedModelWiki($gameId: ID!, $positionedModelId: ID!, $wikiId: ID){
		setPositionedModelWiki(gameId: $gameId, positionedModelId: $positionedModelId, wikiId: $wikiId){
			...gameModel
		}
	}
`;
exports.ADD_FOG_STROKE = (0, graphql_tag_1.default) `
	mutation addFogStroke(
		$gameId: ID!
		$path: [PathNodeInput!]!
		$type: String!
		$size: Int!
		$strokeId: ID!
	) {
		addFogStroke(
			gameId: $gameId
			path: $path
			type: $type
			size: $size
			strokeId: $strokeId
		) {
			_id
		}
	}
`;
exports.ADD_STROKE = (0, graphql_tag_1.default) `
	mutation addStroke(
		$gameId: ID!
		$path: [PathNodeInput!]!
		$type: String!
		$size: Int!
		$color: String!
		$fill: Boolean!
		$strokeId: ID!
	) {
		addStroke(
			gameId: $gameId
			path: $path
			type: $type
			size: $size
			color: $color
			fill: $fill
			strokeId: $strokeId
		) {
			_id
		}
	}
`;
exports.GAME_CHAT = (0, graphql_tag_1.default) `
	mutation gameChatMutation($gameId: ID!, $message: String!) {
		gameChat(gameId: $gameId, message: $message) {
			_id
		}
	}
`;
exports.SET_CHARACTER_ATTRIBUTES = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_CHARACTERS}
	mutation setCharacterAttributes($gameId: ID!, $attributes: [CharacterAttributeInput!]!){
		setCharacterAttributes(gameId: $gameId, attributes: $attributes){
			_id
			...gameCharacters		
		}
	}
`;
exports.SET_CHARACTER_ORDER = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_CHARACTERS}
	mutation setCharacterOrder($gameId: ID!, $characters: [CharacterInput!]!){
		setCharacterOrder(gameId: $gameId, characters: $characters){
			_id
			...gameCharacters
		}
	}
`;
exports.SET_GAME_MAP = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_MAP}
	mutation setGameMap($gameId: ID!, $placeId: ID!, $setFog: Boolean){
		setGameMap(gameId: $gameId, placeId: $placeId, setFog: $setFog){
			_id
			map {
				...gameMap
			}
		}
	}
`;
//endregion
//region Map
exports.CREATE_PIN = (0, graphql_tag_1.default) `
	${gql_fragments_1.PIN_ATTRIBUTES}
	mutation createPin($mapId: ID!, $x: Float!, $y: Float!, $wikiId: ID){
		createPin(mapId: $mapId, x: $x, y: $y, wikiId: $wikiId){
			_id
			...pinAttributes	
		}
	}
`;
exports.DELETE_PIN = (0, graphql_tag_1.default) `
	${gql_fragments_1.PIN_ATTRIBUTES}
	mutation deletePin($pinId: ID!){
		deletePin(pinId: $pinId){
			_id
			...pinAttributes
		}
	}
`;
exports.UPDATE_PIN = (0, graphql_tag_1.default) `
	${gql_fragments_1.PIN_ATTRIBUTES}
	mutation updatePin($pinId: ID!, $pageId: ID){
		updatePin(pinId: $pinId, pageId: $pageId){
			_id
			...pinAttributes
		}
	}
`;
//endregion
//region Model
exports.CREATE_MODEL = (0, graphql_tag_1.default) `
	mutation createModel(
		$name: String!
		$file: Upload!
		$worldId: ID!
		$depth: Float!
		$width: Float!
		$height: Float!
		$notes: String
	) {
		createModel(
			name: $name
			file: $file
			worldId: $worldId
			depth: $depth
			width: $width
			height: $height
			notes: $notes
		) {
			_id
		}
	}
`;
exports.DELETE_MODEL = (0, graphql_tag_1.default) `
	mutation deleteModel($modelId: ID!) {
		deleteModel(modelId: $modelId) {
			_id
		}
	}
`;
exports.UPDATE_MODEL = (0, graphql_tag_1.default) `
	${gql_fragments_1.MODEL_ATTRIBUTES}
	mutation updateModel($modelId: ID!, $name: String!, $file: Upload, $depth: Float!, $width: Float!, $height: Float!, $notes: String){
		updateModel(modelId: $modelId, name: $name, file: $file, depth: $depth, width: $width, height: $height, notes: $notes){
			...modelAttributes
		}
	}
`;
//endregion
//region Server Settings
exports.GENERATE_REGISTER_CODES = (0, graphql_tag_1.default) `
	mutation generateRegisterCodes($amount: Int!) {
		generateRegisterCodes(amount: $amount) {
			_id
			registerCodes
		}
	}
`;
exports.UNLOCK_SERVER = (0, graphql_tag_1.default) `
	mutation unlockServer(
		$unlockCode: String!
		$email: String!
		$username: String!
		$password: String!
	) {
		unlockServer(
			unlockCode: $unlockCode
			email: $email
			username: $username
			password: $password
		)
	}
`;
exports.SET_DEFAULT_WORLD = (0, graphql_tag_1.default) `
	mutation setDefaultWorld($worldId: ID!) {
		setDefaultWorld(worldId: $worldId) {
			_id
			defaultWorld {
				_id
				name
				wikiPage {
					_id
				}
			}
		}
	}
`;
//endregion
//region Wiki Folder
exports.CREATE_FOLDER = (0, graphql_tag_1.default) `
	mutation createFolder($parentFolderId: ID!, $name: String!) {
		createFolder(parentFolderId: $parentFolderId, name: $name) {
			_id
			children {
				_id
				name 
			}
		}
	}
`;
exports.DELETE_FOLDER = (0, graphql_tag_1.default) `
	mutation deleteFolder($folderId: ID!) {
		deleteFolder(folderId: $folderId) {
			_id
			children {
				_id
				name 
			}
		}
	}
`;
exports.MOVE_FOLDER = (0, graphql_tag_1.default) `
	mutation moveFolder($folderId: ID!, $parentFolderId: ID!) {
		moveFolder(folderId: $folderId, parentFolderId: $parentFolderId) {
			_id
			children {
				_id
				name 
			}
		}
	}
`;
exports.RENAME_FOLDER = (0, graphql_tag_1.default) `
	mutation renameFolder($folderId: ID!, $name: String!) {
		renameFolder(folderId: $folderId, name: $name) {
			_id
			name
		}
	}
`;
//endregion
//region Image
exports.CREATE_IMAGE = (0, graphql_tag_1.default) `
	mutation createImage($file: Upload!, $worldId: ID!, $chunkify: Boolean) {
		createImage(file: $file, worldId: $worldId, chunkify: $chunkify) {
			_id
		}
	}
`;
//endregion
//region Wiki
exports.CREATE_WIKI = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_WIKIS}
	mutation createWiki($name: String!, $folderId: ID!){
		createWiki(name: $name, folderId: $folderId){
			${gql_fragments_1.WIKIS_IN_FOLDER_ATTRIBUTES}
		}
	}
`;
exports.DELETE_WIKI = (0, graphql_tag_1.default) `
	mutation deleteWiki($wikiId: ID!) {
		deleteWiki(wikiId: $wikiId) {
			_id
		}
	}
`;
exports.MOVE_WIKI = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_WIKIS}
	mutation moveWiki($wikiId: ID!, $folderId: ID!) {
		moveWiki(wikiId: $wikiId, folderId: $folderId) {
			${gql_fragments_1.WIKIS_IN_FOLDER_ATTRIBUTES}
		}
	}
`;
exports.UPDATE_MODELED_WIKI = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WIKI_ATTRIBUTES}
	mutation updateModeledWiki($wikiId: ID!, $model: ID, $color: String){
		updateModeledWiki(wikiId: $wikiId, model: $model, color: $color){
			...currentWikiAttributes			
		}
	}   
`;
exports.UPDATE_PLACE = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WIKI_ATTRIBUTES}
	mutation updatePlace($placeId: ID!, $mapImageId: ID, $pixelsPerFoot: Int){
		updatePlace(placeId: $placeId, mapImageId: $mapImageId, pixelsPerFoot: $pixelsPerFoot){
			_id
      		...currentWikiAttributes
		}
	}
`;
exports.UPDATE_WIKI = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WIKI_ATTRIBUTES}
	mutation updateWiki($wikiId: ID!, $name: String, $content: Upload, $coverImageId: ID, $type: String){
		updateWiki(wikiId: $wikiId, name: $name, content: $content, coverImageId: $coverImageId, type: $type){
			...currentWikiAttributes
		}
	}
`;
exports.UPDATE_EVENT = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WIKI_ATTRIBUTES}
	mutation updateEventWiki(
		$wikiId: ID!, 
		$calendarId: ID, 
		$age: Int!, 
		$year: Int!, 
		$month: Int!, 
		$day: Int!, 
		$hour: Int!, 
		$minute: Int!, 
		$second: Int!
	){
		updateEventWiki(
			wikiId: $wikiId, 
			calendarId: $calendarId, 
			age: $age, 
			year: $year, 
			month: $month, 
			day: $day, 
			hour: $hour, 
			minute: $minute, 
			second: $second
		){
			...currentWikiAttributes
		}
	}
`;
//endregion
//region World
exports.CREATE_WORLD = (0, graphql_tag_1.default) `
	mutation createWorld($name: String!, $public: Boolean!) {
		createWorld(name: $name, public: $public) {
			_id
			wikiPage {
				_id
			}
		}
	}
`;
exports.RENAME_WORLD = (0, graphql_tag_1.default) `
	mutation renameWorld($worldId: ID!, $newName: String!) {
		renameWorld(worldId: $worldId, newName: $newName) {
			_id
			name
		}
	}
`;
exports.UPSERT_CALENDAR = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_CALENDAR}
	${gql_fragments_1.ACCESS_CONTROL_LIST}
	mutation upsertCalendar($calendarId: ID, $world: ID!, $name: String!, $ages: [AgeInput!]!) {
		upsertCalendar(calendarId: $calendarId, world: $world, name: $name, ages: $ages) {
			...currentWorldCalendar
			...accessControlList
		}
	}
`;
exports.DELETE_CALENDAR = (0, graphql_tag_1.default) `
	mutation deleteCalendar($calendarId: ID!) {
		deleteCalendar(calendarId: $calendarId) {
			_id
		}
	}
`;
//endregion
//region Import
exports.IMPORT_CONTENT = (0, graphql_tag_1.default) `
	mutation importContent($folderId: ID!, $zipFile: Upload!){
		importContent(folderId: $folderId, zipFile: $zipFile){
			_id
			children {
				_id
				name
			}
		}
	}
`;
exports.LOAD_5E_CONTENT = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_FOLDERS}
	mutation load5eContent($worldId: ID!){
		load5eContent(worldId: $worldId){
			_id
		    rootFolder{
			    ...currentWorldFolders
		    }
		}
	}
`;
//endregion
