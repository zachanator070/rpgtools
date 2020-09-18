import gql from "graphql-tag";

export const PERMISSIONS_GRANTED = `
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


export const ACCESS_CONTROL_LIST = `
	... on PermissionControlled {
		canWrite
		canAdmin
		accessControlList {
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
			users{
				_id
				username
			}
			roles{
				_id
				name
			}
		}
	}
`;

export const CURRENT_WORLD_WIKIS = `
	_id
	name
	type
	... on PermissionControlled{
		canWrite
		canAdmin
	}
`;

export const CURRENT_WORLD_FOLDERS = `
	_id
	name
	canWrite
	canAdmin
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
			type
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
		canAdmin
		world{
			_id
		}
		${PERMISSIONS_GRANTED}
		members{
			_id
			username
		}
		${ACCESS_CONTROL_LIST}
	}
`;

export const GET_CURRENT_WORLD = gql`
    query getCurrentWorld($worldId: ID){
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
				${CURRENT_WORLD_FOLDERS}
			}
			${ACCESS_CONTROL_LIST}
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
			${ACCESS_CONTROL_LIST}
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
export const MOVE_FOLDER = gql`
	mutation moveFolder($folderId: ID!, $parentFolderId: ID!){
		moveFolder(folderId: $folderId, parentFolderId: $parentFolderId){
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
			${ACCESS_CONTROL_LIST}
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
            ... on PermissionControlled{
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
            roles{
                _id
                name
            }
        }
    }
`;
export const CURRENT_WIKI_ATTRIBUTES = `
	_id
    type
    name
    content
    ... on PermissionControlled {
	    canWrite
	    canAdmin
    }
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
    pixelsPerFoot
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
			${PERMISSIONS_GRANTED}
		}
	}
`;
export const GRANT_USER_PERMISSION = gql`
	mutation grantUserPermission($userId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			${ACCESS_CONTROL_LIST}
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
export const LOAD_5E_CONTENT = gql`
	mutation load5eContent($worldId: ID!){
		load5eContent(worldId: $worldId){
			_id
		}
	}
`;
export const REVOKE_ROLE_PERMISSION = gql`
	mutation revokeRolePermission($roleId: ID!, $permissionAssignmentId: ID!){
		revokeRolePermission(roleId: $roleId, permissionAssignmentId: $permissionAssignmentId){
			_id
			${PERMISSIONS_GRANTED}
		}
	}
`;
export const REVOKE_USER_PERMISSION = gql`
	mutation revokeUserPermission($userId: ID!, $permissionAssignmentId: ID!){
		revokeUserPermission(userId: $userId, permissionAssignmentId: $permissionAssignmentId){
			_id
			${ACCESS_CONTROL_LIST}
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
            ${ACCESS_CONTROL_LIST}
            ${CURRENT_WORLD_ROLES}
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
	mutation updatePlace($placeId: ID!, $mapImageId: ID, $pixelsPerFoot: Int){
		updatePlace(placeId: $placeId, mapImageId: $mapImageId, pixelsPerFoot: $pixelsPerFoot){
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
            ${ACCESS_CONTROL_LIST}
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
            ${ACCESS_CONTROL_LIST}
        }
    }
`;

export const GAME_MESSAGE = `
    sender
    receiver
    message
    timestamp
`;

export const GAME_PLAYERS = `
	players {
        _id
        username
    }
`;

export const GAME_MAP = `
	map {
		_id
		name
		mapImage {
			_id
			width
			height
			chunks{
				_id
				x
				y
				fileId
			}
		}
		pixelsPerFoot
	}
`;

export const GAME_STROKE = `
	_id
	path{
		_id
		x
		y
	}
	type
	size
	color
	fill
`;

export const GAME_STROKES = `
	strokes{
		${GAME_STROKE}
	}
`;
export const GAME_MODEL = `
	_id
	model{
		_id
		fileId
		depth
		width
		height
		name
	}
	x
	z
	rotation
`;
export const GAME_MODELS = `
	models{
		${GAME_MODEL}
	}
`;
export const GAME_FOG = `
	_id
	path{
		_id
		x
		y
	}
	type
	size
`;
export const GAME_FOG_STROKES = `
	fog{
		${GAME_FOG}
	}
`
export const GAME_ATTRIBUTES = `
	_id
    ${GAME_MAP}
    host{
        _id
    }
	canPaint
	canModel
    canWriteFog
    canWrite
    canAdmin
    ${GAME_PLAYERS}
    messages{
        ${GAME_MESSAGE}
    }
    ${GAME_STROKES}
    fog{
        ${GAME_FOG}
    }
    ${GAME_MODELS}
    ${ACCESS_CONTROL_LIST}
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
			_id
		}
	}	
`;

export const GAME_CHAT_SUBSCRIPTION = gql`
	subscription gameChat($gameId: ID!){
		gameChat(gameId: $gameId){
			${GAME_MESSAGE}
		}
	}
`;

export const GAME_ROSTER_SUBSCRIPTION = gql`
	subscription gameRosterChange($gameId: ID!,){
		gameRosterChange(gameId: $gameId){
			_id
			${GAME_PLAYERS}
		}
	}
`;

export const LEAVE_GAME = gql`
	mutation leaveGame($gameId: ID!){
		leaveGame(gameId: $gameId)
	}
`;

export const MY_GAMES = gql`
	query myGames{
		myGames{
			_id
		}
	}
`;

export const SET_GAME_MAP = gql`
	mutation setGameMap($gameId: ID!, $placeId: ID!, $clearPaint: Boolean, $setFog: Boolean){
		setGameMap(gameId: $gameId, placeId: $placeId, clearPaint: $clearPaint, setFog: $setFog){
			_id
			${GAME_MAP}
			${GAME_STROKES}
			${GAME_FOG_STROKES}
		}
	}
`;

export const GAME_MAP_SUBSCRIPTION = gql`
	subscription gameMapChange($gameId: ID!,){
		gameMapChange(gameId: $gameId){
			_id
			${GAME_MAP}
			${GAME_STROKES}
			${GAME_FOG_STROKES}
		}
	}
`;
export const GAME_MODEL_ADDED_SUBSCRIPTION = gql`
	subscription gameModelAdded($gameId: ID!){
		gameModelAdded(gameId: $gameId){
			${GAME_MODEL}
		}
	}
`;
export const GAME_MODEL_DELETED_SUBSCRIPTION = gql`
	subscription gameModelDeleted($gameId: ID!){
		gameModelDeleted(gameId: $gameId){
			_id
		}
	}
`;
export const MAP_WIKI_ID = gql`
    query {
        mapWiki @client
    }
`;

export const ADD_STROKE = gql`
	mutation addStroke($gameId: ID!, $path: [PathNodeInput!]!, $type: String!, $size: Int!, $color: String!, $fill: Boolean!, $strokeId: ID!){
		addStroke(gameId: $gameId, path: $path, type: $type, size:$size, color:$color, fill:$fill, strokeId: $strokeId){
			_id
		}
	}
`;

export const ADD_FOG_STROKE = gql`
	mutation addFogStroke($gameId: ID!, $path: [PathNodeInput!]!, $type: String!, $size: Int!, $strokeId: ID!){
		addFogStroke(gameId: $gameId, path: $path, type: $type, size:$size, strokeId: $strokeId){
			_id
		}
	}
`;


export const ADD_MODEL = gql`
	mutation addModel($gameId: ID!, $modelId: ID!){
		addModel(gameId: $gameId, modelId: $modelId){
			_id
			${GAME_MODELS}
		}
	}	
`;

export const DELETE_POSITIONED_MODEL = gql`
	mutation deletePositionedModel($gameId: ID!, $positionedModelId: ID!){
		deletePositionedModel(gameId: $gameId, positionedModelId: $positionedModelId){
			_id
			${GAME_MODELS}
		}
	}	
`;

export const GAME_STROKE_SUBSCRIPTION = gql`
	subscription gameStrokeAdded($gameId: ID!){
		gameStrokeAdded(gameId: $gameId){
			${GAME_STROKE}
		}
	}
`;

export const GAME_FOG_SUBSCRIPTION = gql`
	subscription gameFogStrokeAdded($gameId: ID!){
		gameFogStrokeAdded(gameId: $gameId){
			${GAME_FOG}
		}
	}
`;

export const MODEL_ATTRIBUTES = `
	_id
	name
	depth
	width
	height
	fileName
	fileId
	notes
	${ACCESS_CONTROL_LIST}
`;

export const GET_MODELS = gql`
	query getModels($worldId: ID!){
		models(worldId: $worldId){
			${MODEL_ATTRIBUTES}
		}
	}
`;

export const CREATE_MODEL = gql`
	mutation createModel($name: String!, $file: Upload!, $worldId: ID!, $depth: Float!, $width: Float!, $height: Float!, $notes: String){
		createModel(name: $name, file: $file, worldId: $worldId, depth: $depth, width: $width, height: $height, notes: $notes){
			_id
		}
	}
`;

export const UPDATE_MODEL = gql`
	mutation updateModel($modelId: ID!, $name: String!, $file: Upload, $depth: Float!, $width: Float!, $height: Float!, $notes: String){
		updateModel(modelId: $modelId, name: $name, file: $file, depth: $depth, width: $width, height: $height, notes: $notes){
			${MODEL_ATTRIBUTES}
		}
	}
`;

export const DELETE_MODEL = gql`
	mutation deleteModel($modelId: ID!){
		deleteModel(modelId: $modelId){
			_id
		}
	}
`;

export const MY_PERMISSIONS = gql`
	query myPermissions($worldId: ID!){
		myPermissions(worldId: $worldId){
			_id
	        permission
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
				... on Role {
					name
				}
	        }
	        subjectType
        }
    }
`;

export const SET_MODEL_POSITION = gql`
	mutation setModelPosition($gameId: ID!, $positionedModelId: ID!, $x: Float!, $z: Float, $rotation: Float!){
		setModelPosition(gameId: $gameId, positionedModelId: $positionedModelId, x: $x, z: $z, rotation: $rotation){
			${GAME_MODEL}
		}
	}
`;

export const GAME_MODEL_POSITIONED_SUBSCRIPTION = gql`
	subscription gameModelPositioned($gameId: ID!){
		gameModelPositioned(gameId: $gameId){
			${GAME_MODEL}
		}
	} 
`;