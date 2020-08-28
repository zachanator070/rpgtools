import gql from "graphql-tag";
import {GAME} from "./type-constants";

export const CURRENT_WORLD_PERMISSIONS = `
	permissions{
		_id
		permission
		canWrite
		subjectType
		subject {
			_id
			... on World{
				name
			}
			... on WikiPage{
				name
			}
			... on WikiFolder{
				name
			}
			... on Role{
				name
			}
		}
	}
`;
export const USERS_WITH_PERMISSIONS = `
	... on PermissionControlled{
		usersWithPermissions{
            _id
            username
            ${CURRENT_WORLD_PERMISSIONS}
        }
	}
    
`;
export const CURRENT_WORLD_WIKIS = `
	_id
	name
	type
	canWrite
`;
export const CURRENT_WORLD_FOLDERS = `
	_id
	name
	canWrite
	children{
		_id
	}
	pages{
		${CURRENT_WORLD_WIKIS}
	}
`;
export const CURRENT_WORLD_PINS = `
	pins{
		_id
		canWrite
		page{
			name
			_id
		}
		map{
			name
			_id
		}
		x
		y
	}
`;
export const CURRENT_WORLD_ROLES = `
	roles{
		_id
		name
		canWrite
		world{
			_id
		}
		${CURRENT_WORLD_PERMISSIONS}
		members{
			_id
			username
		}
		${USERS_WITH_PERMISSIONS}
	}
`;
export const GET_CURRENT_WORLD = gql`
    query getCurrentWorld($worldId: ID){
        world(worldId: $worldId){
			_id
			name
			canWrite
			canAddRoles
			canHostGame
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
				${CURRENT_WORLD_FOLDERS}
			}
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
			${CURRENT_WORLD_PINS}
			folders{
			    ${CURRENT_WORLD_FOLDERS}
		    }
	    }
    }
    
`;
export const ADD_USER_ROLE = gql`
	mutation addUserRole($userId: ID!, $roleId: ID!){
		addUserRole(userId: $userId, roleId: $roleId){
			_id
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
		}
	}
`;
export const CREATE_FOLDER = gql`
	mutation createFolder($parentFolderId: ID!, $name: String!){
		createFolder(parentFolderId: $parentFolderId, name: $name){
			_id
			folders{
				${CURRENT_WORLD_FOLDERS}
			}
		}
	}
`;
export const CREATE_IMAGE = gql`
	mutation createImage($file: Upload!, $worldId: ID!, $chunkify: Boolean){
		createImage(file: $file, worldId: $worldId, chunkify: $chunkify){
			_id
		}
	}
`;
export const CREATE_PIN = gql`
	mutation createPin($mapId: ID!, $x: Float!, $y: Float!, $wikiId: ID){
		createPin(mapId: $mapId, x: $x, y: $y, wikiId: $wikiId){
			_id
			${CURRENT_WORLD_PINS}
		}
	}
`;
export const CREATE_ROLE = gql`
	mutation createRole($worldId: ID!, $name: String!){
		createRole(worldId: $worldId, name: $name){
			_id
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
		}
	}
`;
export const CREATE_WIKI = gql`
	mutation createWiki($name: String!, $folderId: ID!){
		createWiki(name: $name, folderId: $folderId){
			_id
			folders{
				${CURRENT_WORLD_FOLDERS}
			}
		}
	}
`;
export const CREATE_WORLD = gql`
    mutation createWorld($name: String!, $public: Boolean!){
        createWorld(name: $name, public: $public){
            _id
            wikiPage {
                _id
            }
        }
    }
`;
export const GET_CURRENT_MAP = gql`
    query getWiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            _id
            type
            name
            content
            canWrite
            ... on Place {
                mapImage {
	                _id
	                name
	                width
	                height
	                chunkWidth
	                chunkHeight
	                chunks{
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
export const GET_CURRENT_USER = gql`
    query {
        currentUser {
            _id
            username
            email
            currentWorld{
                _id
                wikiPage {
                    _id
                }
            }
            ${CURRENT_WORLD_PERMISSIONS}
            ${CURRENT_WORLD_ROLES}
        }
    }
`;
export const CURRENT_WIKI_ATTRIBUTES = `
	_id
    type
    name
    content
    canWrite
    world {
        _id
    }
    coverImage {
        _id
        name
        width
        height
        chunks{
            _id
            fileId
        }
        icon{
            _id
            chunks{
                _id
                fileId
            }
        }
    }
`;
export const CURRENT_WIKI_PLACE_ATTRIBUTES = `
	mapImage {
        _id
        name
        width
        height
        chunks{
            _id
            fileId
        }
        icon{
            _id
            chunks{
                _id
                fileId
            }
        }
    }
`;
export const DELETE_FOLDER = gql`
	mutation deleteFolder($folderId: ID!){
		deleteFolder(folderId: $folderId){
			_id
			folders{
				${CURRENT_WORLD_FOLDERS}
			}
		}
	}
	
`;
export const DELETE_PIN = gql`
	mutation deletePin($pinId: ID!){
		deletePin(pinId: $pinId){
			_id
			${CURRENT_WORLD_PINS}
		}
	}
`;
export const DELETE_ROLE = gql`
	mutation deleteRole($roleId: ID!){
		deleteRole(roleId: $roleId){
			_id
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
		}
	}
`;
export const DELETE_WIKI = gql`
	mutation deleteWiki($wikiId: ID!){
		deleteWiki(wikiId: $wikiId) {
			_id
			folders{
				${CURRENT_WORLD_FOLDERS}
			}
		}
	}
`;
export const GENERATE_REGISTER_CODES = gql`
	mutation generateRegisterCodes($amount: Int!){
		generateRegisterCodes(amount: $amount){
			_id
			registerCodes
		}
	}
`;
export const GRANT_ROLE_PERMISSION = gql`
	mutation grantRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			${CURRENT_WORLD_PERMISSIONS}
		}
	}
`;
export const GRANT_USER_PERMISSION = gql`
	mutation grantUserPermission($userId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			${USERS_WITH_PERMISSIONS}
		}
	}
`;
export const LOGIN_QUERY = gql`
    mutation login($username: String!, $password: String!){
        login(username: $username, password: $password){
            _id
        }
    }
`;
export const LOGOUT_QUERY = gql`
    mutation {
        logout
    }
`;
export const MAP_WIKI = gql`
	query currentWiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            ${CURRENT_WIKI_ATTRIBUTES}
            ... on Place {
                ${CURRENT_WIKI_PLACE_ATTRIBUTES}
            }
        }
    }
`;
export const REGISTER_MUTATION = gql`
    mutation register($registerCode: String!, $email: String!, $username: String!, $password: String!){
        register(registerCode: $registerCode, email: $email, username: $username, password: $password){
            _id
        }
    }
`;
export const REMOVE_USER_ROLE = gql`
	mutation removeUserRole($userId: ID!, $roleId: ID!){
		removeUserRole(userId: $userId, roleId: $roleId){
			_id
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
		}
	}
`;
export const RENAME_FOLDER = gql`
	mutation renameFolder($folderId: ID!, $name: String!){
		renameFolder(folderId: $folderId, name: $name){
			_id
			name
		}
	}
`;
export const RENAME_WORLD = gql`
	mutation renameWorld($worldId: ID!, $newName: String!){
		renameWorld(worldId: $worldId, newName: $newName){
			_id
			name
		}
	}
`;
export const REVOKE_ROLE_PERMISSION = gql`
	mutation revokeRolePermission($roleId: ID!, $permissionAssignmentId: ID!){
		revokeRolePermission(roleId: $roleId, permissionAssignmentId: $permissionAssignmentId){
			_id
			${CURRENT_WORLD_PERMISSIONS}
		}
	}
`;
export const REVOKE_USER_PERMISSION = gql`
	mutation revokeUserPermission($userId: ID!, $permissionAssignmentId: ID!){
		revokeUserPermission(userId: $userId, permissionAssignmentId: $permissionAssignmentId){
			_id
			${USERS_WITH_PERMISSIONS}
		}
	}
`;

export const SEARCH_USERS = gql`
	query searchUsers($username: String!){
		users(username: $username){
			page
			totalPages
			docs{
				_id
				username
			}
		}
	}
`;

export const GET_SERVER_CONFIG = gql`
    query serverConfig{
        serverConfig{
            _id
            version
            registerCodes
            adminUsers{
                _id
                username
                ${CURRENT_WORLD_PERMISSIONS}
            }
        }
    }
`;
export const SET_CURRENT_WORLD = gql`
	mutation setCurrentWorld($worldId: ID!){
		setCurrentWorld(worldId: $worldId){
			_id
		}
	}
`;
export const UNLOCK_SERVER = gql`
    mutation unlockServer($unlockCode: String!, $email: String!, $username: String!, $password: String!){
        unlockServer(unlockCode: $unlockCode, email: $email, username: $username, password: $password)
    }
`;
export const UPDATE_PERSON = gql`
	mutation updatePerson($personId: ID!, $name: String, $content: String, $coverImageId: ID){
		updatePerson(personId: $personId, name: $name, content: $content, coverImageId: $coverImageId){
			_id
		}
	}
`;
export const UPDATE_PIN = gql`
	mutation updatePin($pinId: ID!, $pageId: ID){
		updatePin(pinId: $pinId, pageId: $pageId){
			_id
			${CURRENT_WORLD_PINS}
		}
	}
`;
export const UPDATE_PLACE = gql`
	mutation updatePlace($placeId: ID!, $mapImageId: ID){
		updatePlace(placeId: $placeId, mapImageId: $mapImageId){
			_id
            ${CURRENT_WIKI_PLACE_ATTRIBUTES}
		}
	}
`;
export const UPDATE_WIKI = gql`
	mutation updateWiki($wikiId: ID!, $name: String, $content: Upload, $coverImageId: ID, $type: String){
		updateWiki(wikiId: $wikiId, name: $name, content: $content, coverImageId: $coverImageId, type: $type){
			${CURRENT_WIKI_ATTRIBUTES}
		}
	}
`;
export const GET_WORLDS = gql`
	query getWorlds($page: Int!){
		worlds(page: $page){
			docs{
				_id
				name
				wikiPage {
					_id
					type
				}
			}
			totalPages
		}	
	}
`;
export const GET_CURRENT_WIKI = gql`
    query currentWiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            ${CURRENT_WIKI_ATTRIBUTES}
            ${USERS_WITH_PERMISSIONS}
            ... on Place {
                ${CURRENT_WIKI_PLACE_ATTRIBUTES}
            }
            
        }
    }
`;

export const CREATE_GAME = gql`
    mutation createGame($worldId: ID!, $password: String){
        createGame(worldId: $worldId, password: $password){
            _id
        }
    }
`;

export const GAME_ATTRIBUTES = `
	_id
    map {
        _id
        mapImage {
            _id
            fileId
        }
    }
    players {
        _id
        username
    }
    messages {
        sender
        message
        timestamp
    }
`;

export const JOIN_GAME = gql`
    mutation joinGame($gameId: ID!, $password: String){
        joinGame(gameId: $gameId, password: $password){
            ${GAME_ATTRIBUTES}
        }
    }
`;

export const GET_GAME = gql`
	query getGame($gameId: ID!){
		game(gameId: $gameId){
			${GAME_ATTRIBUTES}
		}
	}
`;

export const GAME_CHAT = gql`
	mutation gameChat($gameId: ID!, $message: String!){
		gameChat(gameId: $gameId, message: $message){
			${GAME_ATTRIBUTES}
		}
	}	
`;