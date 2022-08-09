import gql from "graphql-tag";
import {
	ACCESS_CONTROL_LIST,
	CURRENT_WIKI_ATTRIBUTES,
	CURRENT_WIKI_PLACE_ATTRIBUTES,
	CURRENT_WORLD_FOLDERS,
	CURRENT_WORLD_PINS,
	CURRENT_WORLD_ROLES,
	CURRENT_WORLD_WIKIS,
	GAME_ATTRIBUTES,
	GAME_CHARACTERS,
	GAME_FOG_STROKES,
	GAME_MAP,
	GAME_MODEL,
	GAME_MODELS,
	GAME_STROKES,
	MODEL_ATTRIBUTES,
	PERMISSIONS_GRANTED,
	WIKIS_IN_FOLDER_ATTRIBUTES
} from "./gql-fragments";

//region Authentication

export const LOGIN_QUERY = gql`
	mutation login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			_id
		}
	}
`;
export const LOGOUT_QUERY = gql`
	mutation logout{
		logout
	}
`;
//endregion

//region Role

export const CREATE_ROLE = gql`
	${CURRENT_WORLD_ROLES}
	mutation createRole($worldId: ID!, $name: String!){
		createRole(worldId: $worldId, name: $name){
			_id
			...currentWorldRoles
		}
	}
`;
export const DELETE_ROLE = gql`
	mutation deleteRole($roleId: ID!) {
		deleteRole(roleId: $roleId) {
			_id
		}
	}
`;
export const ADD_USER_ROLE = gql`
	${CURRENT_WORLD_ROLES}
	mutation addUserRole($userId: ID!, $roleId: ID!){
		addUserRole(userId: $userId, roleId: $roleId){
			_id
			...currentWorldRoles		
		}
	}
`;
export const REMOVE_USER_ROLE = gql`
	${CURRENT_WORLD_ROLES}
	mutation removeUserRole($userId: ID!, $roleId: ID!){
		removeUserRole(userId: $userId, roleId: $roleId){
			_id
			...currentWorldRoles
		}
	}
`;
export const GRANT_ROLE_PERMISSION = gql`
	${PERMISSIONS_GRANTED}
	mutation grantRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			...permissionsGranted
		}
	}
`;
export const REVOKE_ROLE_PERMISSION = gql`
	${PERMISSIONS_GRANTED}
	mutation revokeRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!){
		revokeRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId){
			_id
			...permissionsGranted		
		}
	}
`;
//endregion

//region User

export const REGISTER_MUTATION = gql`
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
export const SET_CURRENT_WORLD = gql`
	mutation setCurrentWorld($worldId: ID!) {
		setCurrentWorld(worldId: $worldId) {
			_id
		}
	}
`;
export const GRANT_USER_PERMISSION = gql`
	${ACCESS_CONTROL_LIST}
	mutation grantUserPermission($userId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			...accessControlList		
		}
	}
`;
export const REVOKE_USER_PERMISSION = gql`
	${ACCESS_CONTROL_LIST}
	mutation revokeUserPermission($userId: ID!, $permission: String!, $subjectId: ID!){
		revokeUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId){
			_id
			...accessControlList
		}
	}
`;
//endregion

//region Game

export const CREATE_GAME = gql`
	${ACCESS_CONTROL_LIST}
	mutation createGame($worldId: ID!, $password: String, $characterName: String){
		createGame(worldId: $worldId, password: $password, characterName: $characterName){
			_id
			...accessControlList
		}
	}
`;

export const JOIN_GAME = gql`
	${GAME_ATTRIBUTES}
	mutation joinGame($gameId: ID!, $password: String, $characterName: String){
		joinGame(gameId: $gameId, password: $password, characterName: $characterName){
			...gameAttributes
		}
	}
`;
export const LEAVE_GAME = gql`
	mutation leaveGame($gameId: ID!) {
		leaveGame(gameId: $gameId)
	}
`;

export const ADD_MODEL = gql`
	${GAME_MODELS}
	mutation addModel($gameId: ID!, $modelId: ID!, $wikiId: ID, $color: String){
		addModel(gameId: $gameId, modelId: $modelId, wikiId: $wikiId, color: $color){
			_id
			...gameModels
		}
	}	
`;
export const DELETE_POSITIONED_MODEL = gql`
	${GAME_MODELS}
	mutation deletePositionedModel($gameId: ID!, $positionedModelId: ID!){
		deletePositionedModel(gameId: $gameId, positionedModelId: $positionedModelId){
			_id
			...gameModels		
		}
	}	
`;
export const SET_MODEL_COLOR = gql`
	${GAME_MODEL}
	mutation setModelColor($gameId: ID!, $positionedModelId: ID!, $color: String){
		setModelColor(gameId: $gameId, positionedModelId: $positionedModelId, color: $color){
			...gameModel
		}
	}
`;
export const SET_MODEL_POSITION = gql`
	${GAME_MODEL}
	mutation setModelPosition($gameId: ID!, $positionedModelId: ID!, $x: Float!, $z: Float!, $lookAtX: Float!, $lookAtZ: Float!){
		setModelPosition(gameId: $gameId, positionedModelId: $positionedModelId, x: $x, z: $z, lookAtX: $lookAtX, lookAtZ: $lookAtZ){
			...gameModel
		}
	}
`;
export const SET_POSITIONED_MODEL_WIKI = gql`
	${GAME_MODEL}
	mutation setPositionedModelWiki($gameId: ID!, $positionedModelId: ID!, $wikiId: ID){
		setPositionedModelWiki(gameId: $gameId, positionedModelId: $positionedModelId, wikiId: $wikiId){
			...gameModel
		}
	}
`;

export const ADD_FOG_STROKE = gql`
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

export const ADD_STROKE = gql`
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

export const GAME_CHAT = gql`
	mutation gameChatMutation($gameId: ID!, $message: String!) {
		gameChat(gameId: $gameId, message: $message) {
			_id
		}
	}
`;

export const SET_CHARACTER_ATTRIBUTES = gql`
	${GAME_CHARACTERS}
	mutation setCharacterAttributes($gameId: ID!, $str: Int, $dex: Int, $con: Int, $int: Int, $wis: Int, $cha: Int){
		setCharacterAttributes(gameId: $gameId, str: $str, dex: $dex, con: $con, int: $int, wis: $wis, cha: $cha){
			_id
			...gameCharacters		
		}
	}
`;
export const SET_CHARACTER_ORDER = gql`
	${GAME_CHARACTERS}
	mutation setCharacterOrder($gameId: ID!, $characters: [CharacterInput!]!){
		setCharacterOrder(gameId: $gameId, characters: $characters){
			_id
			...gameCharacters
		}
	}
`;
export const SET_GAME_MAP = gql`
	${GAME_MAP}
	${GAME_STROKES}
	${GAME_FOG_STROKES}
	mutation setGameMap($gameId: ID!, $placeId: ID!, $clearPaint: Boolean, $setFog: Boolean){
		setGameMap(gameId: $gameId, placeId: $placeId, clearPaint: $clearPaint, setFog: $setFog){
			_id
			...gameMap
			...gameStrokes
			...gameFogStrokes
		}
	}
`;
//endregion

//region Map

export const CREATE_PIN = gql`
	${CURRENT_WORLD_PINS}
	mutation createPin($mapId: ID!, $x: Float!, $y: Float!, $wikiId: ID){
		createPin(mapId: $mapId, x: $x, y: $y, wikiId: $wikiId){
			_id
			...currentWorldPins	
		}
	}
`;
export const DELETE_PIN = gql`
	${CURRENT_WORLD_PINS}
	mutation deletePin($pinId: ID!){
		deletePin(pinId: $pinId){
			_id
			...currentWorldPins
		}
	}
`;
export const UPDATE_PIN = gql`
	${CURRENT_WORLD_PINS}
	mutation updatePin($pinId: ID!, $pageId: ID){
		updatePin(pinId: $pinId, pageId: $pageId){
			_id
			...currentWorldPins
		}
	}
`;
//endregion

//region Model

export const CREATE_MODEL = gql`
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
export const DELETE_MODEL = gql`
	mutation deleteModel($modelId: ID!) {
		deleteModel(modelId: $modelId) {
			_id
		}
	}
`;
export const UPDATE_MODEL = gql`
	${MODEL_ATTRIBUTES}
	mutation updateModel($modelId: ID!, $name: String!, $file: Upload, $depth: Float!, $width: Float!, $height: Float!, $notes: String){
		updateModel(modelId: $modelId, name: $name, file: $file, depth: $depth, width: $width, height: $height, notes: $notes){
			...modelAttributes
		}
	}
`;
//endregion

//region Server Settings

export const GENERATE_REGISTER_CODES = gql`
	mutation generateRegisterCodes($amount: Int!) {
		generateRegisterCodes(amount: $amount) {
			_id
			registerCodes
		}
	}
`;
export const UNLOCK_SERVER = gql`
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
//endregion

//region Wiki Folder

export const CREATE_FOLDER = gql`
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
export const DELETE_FOLDER = gql`
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
export const MOVE_FOLDER = gql`
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
export const RENAME_FOLDER = gql`
	mutation renameFolder($folderId: ID!, $name: String!) {
		renameFolder(folderId: $folderId, name: $name) {
			_id
			name
		}
	}
`;
//endregion

//region Image

export const CREATE_IMAGE = gql`
	mutation createImage($file: Upload!, $worldId: ID!, $chunkify: Boolean) {
		createImage(file: $file, worldId: $worldId, chunkify: $chunkify) {
			_id
		}
	}
`;
//endregion

//region Wiki

export const CREATE_WIKI = gql`
	${CURRENT_WORLD_FOLDERS}
	mutation createWiki($name: String!, $folderId: ID!){
		createWiki(name: $name, folderId: $folderId){
			...currentWorldFolders
		}
	}
`;

export const DELETE_WIKI = gql`
	mutation deleteWiki($wikiId: ID!) {
		deleteWiki(wikiId: $wikiId) {
			_id
		}
	}
`;
export const MOVE_WIKI = gql`
	${CURRENT_WORLD_WIKIS}
	mutation moveWiki($wikiId: ID!, $folderId: ID!) {
		moveWiki(wikiId: $wikiId, folderId: $folderId) {
			${WIKIS_IN_FOLDER_ATTRIBUTES}
		}
	}
`;

export const UPDATE_MODELED_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	mutation updateModeledWiki($wikiId: ID!, $model: ID, $color: String){
		updateModeledWiki(wikiId: $wikiId, model: $model, color: $color){
			...currentWikiAttributes			
		}
	}   
`;
export const UPDATE_PLACE = gql`
	${CURRENT_WIKI_PLACE_ATTRIBUTES}
	mutation updatePlace($placeId: ID!, $mapImageId: ID, $pixelsPerFoot: Int){
		updatePlace(placeId: $placeId, mapImageId: $mapImageId, pixelsPerFoot: $pixelsPerFoot){
			_id
      		...currentWikiPlaceAttributes
		}
	}
`;
export const UPDATE_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	mutation updateWiki($wikiId: ID!, $name: String, $content: Upload, $coverImageId: ID, $type: String){
		updateWiki(wikiId: $wikiId, name: $name, content: $content, coverImageId: $coverImageId, type: $type){
			...currentWikiAttributes
		}
	}
`;
//endregion

//region World

export const CREATE_WORLD = gql`
	mutation createWorld($name: String!, $public: Boolean!) {
		createWorld(name: $name, public: $public) {
			_id
			wikiPage {
				_id
			}
		}
	}
`;
export const RENAME_WORLD = gql`
	mutation renameWorld($worldId: ID!, $newName: String!) {
		renameWorld(worldId: $worldId, newName: $newName) {
			_id
			name
		}
	}
`;

//endregion

//region Import

export const IMPORT_CONTENT = gql`
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
export const LOAD_5E_CONTENT = gql`
	${CURRENT_WORLD_FOLDERS}
	mutation load5eContent($worldId: ID!, $creatureCodex: Boolean, $tomeOfBeasts: Boolean){
		load5eContent(worldId: $worldId, creatureCodex: $creatureCodex, tomeOfBeasts: $tomeOfBeasts){
			_id
		    rootFolder{
			    ...currentWorldFolders
		    }
		}
	}
`;

//endregion