import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST, CURRENT_WIKI_ATTRIBUTES, CURRENT_WIKI_PLACE_ATTRIBUTES, CURRENT_WORLD_CALENDAR, CURRENT_WORLD_FOLDERS, CURRENT_WORLD_ROLES, CURRENT_WORLD_WIKIS, GAME_ATTRIBUTES, MODEL_ATTRIBUTES, PIN_ATTRIBUTES, SERVER_CONFIG_ROLES, WIKIS_IN_FOLDER_ATTRIBUTES } from "./gql-fragments";
//region User
export const GET_CURRENT_USER = gql `
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
export const SEARCH_USERS = gql `
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
export const SEARCH_ROLES = gql `
	${CURRENT_WORLD_ROLES}
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
export const GET_GAME = gql `
	${GAME_ATTRIBUTES}
	query getGame($gameId: ID!){
		game(gameId: $gameId){
			...gameAttributes
		}
	}
`;
export const MY_GAMES = gql `
	query myGames {
		myGames {
			_id
		}
	}
`;
//endregion
//region Map
export const GET_CURRENT_MAP = gql `
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
export const GET_MODELS = gql `
	${MODEL_ATTRIBUTES}
	query getModels($worldId: ID!){
		models(worldId: $worldId){
			...modelAttributes
		}
	}
`;
//endregion
//region Server Settings
export const GET_SERVER_CONFIG = gql `
	${ACCESS_CONTROL_LIST}
	${SERVER_CONFIG_ROLES}
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
export const GET_WIKI = gql `
	${CURRENT_WIKI_ATTRIBUTES}
	${ACCESS_CONTROL_LIST}
	${CURRENT_WIKI_PLACE_ATTRIBUTES}
	query currentWiki($wikiId: ID!){
		wiki(wikiId: $wikiId) {
			...currentWikiAttributes
			...accessControlList
			... on Place {
					...currentWikiPlaceAttributes
			}
				
		}
	}
`;
export const SEARCH_WIKIS = gql `
	${MODEL_ATTRIBUTES}
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
			}
			nextPage
		}
	}
`;
export const WIKIS_IN_FOLDER = gql `
	${CURRENT_WORLD_WIKIS}
	query wikisInFolder($folderId: ID!, $page: Int){
		wikisInFolder(folderId: $folderId, page: $page){
			docs {
				${WIKIS_IN_FOLDER_ATTRIBUTES}
			}
			nextPage
		}
	}
`;
//endregion
//region Folders
export const FOLDERS = gql `
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
export const GET_FOLDER_PATH = gql `
	query getFolderPath($wikiId: ID!) {
		getFolderPath(wikiId: $wikiId) {
			_id
			name
		}
	}
`;
//endregion
//region Game
export const GAME_WIKI = gql `
	${CURRENT_WIKI_ATTRIBUTES}
	query wiki($wikiId: ID!){
		wiki(wikiId: $wikiId) {
			...currentWikiAttributes
		}
	}
`;
//endregion
//region World
export const GET_CURRENT_WORLD = gql `
	${CURRENT_WORLD_FOLDERS}
	${ACCESS_CONTROL_LIST}
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
export const GET_WORLDS = gql `
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
export const GET_PINS = gql `
	${PIN_ATTRIBUTES}
	query pins($worldId: ID!, $page: Int) {
		pins(worldId: $worldId, page: $page) {
			docs {
				...pinAttributes
			}
        }
		
	}
`;
export const GET_CALENDARS = gql `
	${CURRENT_WORLD_CALENDAR}
	query calendars($worldId: ID!) {
		calendars(worldId: $worldId) {
			...currentWorldCalendar
		}
	}
`;
//endregion
