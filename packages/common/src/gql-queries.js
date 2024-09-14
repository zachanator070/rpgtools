"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_CALENDARS = exports.GET_PINS = exports.GET_WORLDS = exports.GET_CURRENT_WORLD = exports.GAME_WIKI = exports.GET_FOLDER_PATH = exports.FOLDERS = exports.SEARCH_EVENTS = exports.WIKIS_IN_FOLDER = exports.SEARCH_WIKIS = exports.GET_WIKI = exports.GET_SERVER_CONFIG = exports.GET_MODELS = exports.GET_CURRENT_MAP = exports.GET_FOG_STROKES = exports.GET_STROKES = exports.MY_GAMES = exports.GET_GAME = exports.SEARCH_ROLES = exports.SEARCH_USERS = exports.GET_CURRENT_USER = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const gql_fragments_1 = require("./gql-fragments");
//region User
exports.GET_CURRENT_USER = (0, graphql_tag_1.default) `
	query currentUser{
		currentUser {
			_id
			username
			email
			currentWorld {
				_id
				wikiPage {
					_id
				}
			}
			roles {
				_id
				name
			}
		}
	}
`;
exports.SEARCH_USERS = (0, graphql_tag_1.default) `
	query searchUsers($username: String!) {
		users(username: $username) {
			page
			totalPages
			docs {
				_id
				username
			}
		}
	}
`;
//endregion
//region Roles
exports.SEARCH_ROLES = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_ROLES}
	query roles($worldId: ID, $name: String, $canAdmin: Boolean) {
		roles(worldId: $worldId, name: $name, canAdmin: $canAdmin) {
			docs {
				_id
				name
				...currentWorldRoles
			}
		}
	}
`;
//endregion
//region Game
exports.GET_GAME = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_ATTRIBUTES}
	query getGame($gameId: ID!){
		game(gameId: $gameId){
			...gameAttributes
		}
	}
`;
exports.MY_GAMES = (0, graphql_tag_1.default) `
	query myGames {
		myGames {
			_id
		}
	}
`;
exports.GET_STROKES = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_STROKE}
	query getStrokes($gameId: ID!, $page: Int) {
		strokes(gameId: $gameId, page: $page) {
			docs {
				...gameStroke
			}
			nextPage
			totalDocs
		}
	}
`;
exports.GET_FOG_STROKES = (0, graphql_tag_1.default) `
	${gql_fragments_1.GAME_FOG}
	query getFogStrokes($gameId: ID!, $page: Int) {
		fogStrokes(gameId: $gameId, page: $page) {
			docs {
				...gameFog
			}
			nextPage
			totalDocs
		}
	}
`;
//endregion
//region Map
exports.GET_CURRENT_MAP = (0, graphql_tag_1.default) `
	query getWiki($wikiId: ID!) {
		wiki(wikiId: $wikiId) {
			_id
			type
			name
			content
			... on PermissionControlled {
				canWrite
				canAdmin
			}
			... on Place {
				mapImage {
					_id
					name
					width
					height
					chunkWidth
					chunkHeight
					chunks {
						_id
						fileId
						width
						height
						x
						y
					}
				}
			}
		}
	}
`;
//endregion
//region Model
exports.GET_MODELS = (0, graphql_tag_1.default) `
	${gql_fragments_1.MODEL_ATTRIBUTES}
	query getModels($worldId: ID!){
		models(worldId: $worldId){
			...modelAttributes
		}
	}
`;
//endregion
//region Server Settings
exports.GET_SERVER_CONFIG = (0, graphql_tag_1.default) `
	${gql_fragments_1.ACCESS_CONTROL_LIST}
	${gql_fragments_1.SERVER_CONFIG_ROLES}
	query serverConfig{
		serverConfig{
			_id
			version
			registerCodes
			canCreateWorlds
			serverNeedsSetup
			defaultWorld {
				_id
				name
				wikiPage {
					_id
				}
			}
			...accessControlList
			...serverConfigRoles
		}
	}
`;
//endregion
//region Wiki
exports.GET_WIKI = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WIKI_ATTRIBUTES}
	query currentWiki($wikiId: ID!){
		wiki(wikiId: $wikiId) {
			...currentWikiAttributes		
		}
	}
`;
exports.SEARCH_WIKIS = (0, graphql_tag_1.default) `
	${gql_fragments_1.MODEL_ATTRIBUTES}
	${gql_fragments_1.EVENT_WIKI_ATTRIBUTES}
	query wikis($worldId: ID!, $name: String, $types: [String!], $canAdmin: Boolean, $hasModel: Boolean, $page: Int){
		wikis(worldId: $worldId, name: $name, types: $types, canAdmin: $canAdmin, hasModel: $hasModel, page: $page){
			docs{
				_id
				name
				type
				... on ModeledWiki {
					model{
						...modelAttributes
					}
					modelColor
				}
				... on PermissionControlled{
					canAdmin
				}
				... on Event {
					...eventWikiAttributes
				}
			}
			nextPage
		}
	}
`;
exports.WIKIS_IN_FOLDER = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_WIKIS}
	query wikisInFolder($folderId: ID!, $page: Int){
		wikisInFolder(folderId: $folderId, page: $page){
			docs {
				${gql_fragments_1.WIKIS_IN_FOLDER_ATTRIBUTES}
			}
			nextPage
		}
	}
`;
exports.SEARCH_EVENTS = (0, graphql_tag_1.default) `
	${gql_fragments_1.EVENT_WIKI_ATTRIBUTES}
	query events($worldId: ID!, $relatedWikiIds: [String!], $calendarIds: [String!]) {
		events(worldId: $worldId, relatedWikiIds: $relatedWikiIds, calendarIds: $calendarIds) {
			docs {
				...eventWikiAttributes
			}
			nextPage
		}
	}
`;
//endregion
//region Folders
exports.FOLDERS = (0, graphql_tag_1.default) `
	query folders($worldId: ID!, $name: String, $canAdmin: Boolean) {
		folders(worldId: $worldId, name: $name, canAdmin: $canAdmin) {
			_id
			name
			children {
				_id
				name
			}
			canWrite
			canAdmin
		}
	}
`;
exports.GET_FOLDER_PATH = (0, graphql_tag_1.default) `
	query getFolderPath($wikiId: ID!) {
		getFolderPath(wikiId: $wikiId) {
			_id
			name
		}
	}
`;
//endregion
//region Game
exports.GAME_WIKI = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WIKI_ATTRIBUTES}
	query wiki($wikiId: ID!){
		wiki(wikiId: $wikiId) {
			...currentWikiAttributes
		}
	}
`;
//endregion
//region World
exports.GET_CURRENT_WORLD = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_FOLDERS}
	${gql_fragments_1.ACCESS_CONTROL_LIST}
	query currentWorld($worldId: ID){
		world(worldId: $worldId){
			_id
			name
			canWrite
			canAdmin
			canAddRoles
			canHostGame
			canAddModels
			wikiPage {
				_id
				name
				mapImage {
					_id
					width
					height
					chunkWidth
					chunkHeight
					chunks {
						fileId
						x
						y
						width
						height
					}
				}
			}
			rootFolder{
				...currentWorldFolders
			}
			...accessControlList
		}
	}
`;
exports.GET_WORLDS = (0, graphql_tag_1.default) `
	query worlds($name: String, $page: Int) {
		worlds(name: $name, page: $page) {
			docs {
				_id
				name
				wikiPage {
					_id
					type
				}
			}
			totalDocs
			totalPages
		}
	}
`;
exports.GET_PINS = (0, graphql_tag_1.default) `
	${gql_fragments_1.PIN_ATTRIBUTES}
	query pins($worldId: ID!, $page: Int) {
		pins(worldId: $worldId, page: $page) {
			docs {
				...pinAttributes
			}
        }
		
	}
`;
exports.GET_CALENDARS = (0, graphql_tag_1.default) `
	${gql_fragments_1.CURRENT_WORLD_CALENDAR}
	query calendars($worldId: ID!) {
		calendars(worldId: $worldId) {
			...currentWorldCalendar
		}
	}
`;
//endregion
