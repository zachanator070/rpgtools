import gql from "graphql-tag";

export const WIKIS_IN_FOLDER_ATTRIBUTES = `
	...currentWorldWikis
	folder{
		_id
		name
	}
	world{
		_id
	}
`;
export const PERMISSIONS_GRANTED = gql`
    fragment permissionsGranted on Role {
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
                canAdmin
            }
        }
    }
`;
export const ACCESS_CONTROL_LIST = gql`
    fragment accessControlList on PermissionControlled {
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
    }
`;
export const CURRENT_WORLD_WIKIS = gql`
    fragment currentWorldWikis on WikiPage {
        _id
        name
        type
        ... on PermissionControlled{
            canWrite
            canAdmin
        }
        ... on ModeledWiki{
            model {
                name
                fileName
                width
                depth
                height
                _id
            }
            modelColor
        }
    }
`;
export const CURRENT_WORLD_FOLDERS = gql`
    ${ACCESS_CONTROL_LIST}
    fragment currentWorldFolders on WikiFolder {
        _id
        name
        canWrite
        canAdmin
        children{
            _id
        }
        ...accessControlList
	}
`;
export const CURRENT_WORLD_PINS = gql`
    fragment currentWorldPins on World {
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
    }
`;
export const CURRENT_WORLD_ROLES = gql`
    ${PERMISSIONS_GRANTED}
    ${ACCESS_CONTROL_LIST}
    fragment currentWorldRoles on World {
        roles{
            _id
            name
            canWrite
            canAdmin
            world{
                _id
            }
            ...permissionsGranted
            members{
                _id
                username
            }
            ...accessControlList
        }
    }
`;
export const SERVER_CONFIG_ROLES = gql`
    ${PERMISSIONS_GRANTED}
    ${ACCESS_CONTROL_LIST}
    fragment serverConfigRoles on ServerConfig {
        roles{
            _id
            name
            canWrite
            canAdmin
            world{
                _id
            }
            ...permissionsGranted
            members{
                _id
                username
            }
            ...accessControlList
        }
    }
`;
export const CURRENT_WIKI_PLACE_ATTRIBUTES = gql`
    fragment currentWikiPlaceAttributes on Place {
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
    }
`;
export const MODEL_ATTRIBUTES = gql`
    ${ACCESS_CONTROL_LIST}
    fragment modelAttributes on Model {
        _id
        name
        depth
        width
        height
        fileName
        fileId
        notes
        ...accessControlList
    }
`;
export const CURRENT_WIKI_ATTRIBUTES = gql`
    ${CURRENT_WIKI_PLACE_ATTRIBUTES}
    ${MODEL_ATTRIBUTES}
    fragment currentWikiAttributes on WikiPage {
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
        ... on Place {
            ...currentWikiPlaceAttributes
        }
        ... on ModeledWiki {
            model{
                ...modelAttributes
            }
            modelColor
        }
        folder{
            _id
        }
    }
`;
export const GAME_MESSAGE = gql`
    fragment gameMessage on GameMessage {
        sender
        receiver
        message
        timestamp
    }
`;
export const GAME_CHARACTERS = gql`
    fragment gameCharacters on Game {
        characters {
            name
            player {
                _id
                username
            }
            str
            dex
            con
            int
            wis
            cha
        }
    }
`;
export const GAME_MAP = gql`
    fragment gameMap on Game {
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
    }
`;
export const GAME_STROKE = gql`
    fragment gameStroke on Stroke {
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
    }
`;
export const GAME_STROKES = gql`
    ${GAME_STROKE}
    fragment gameStrokes on Game {
        strokes{
            ...gameStroke
        }
    }
`;
export const GAME_MODEL = gql`
    fragment gameModel on PositionedModel {
        _id
        model{
            _id
            fileId
            depth
            width
            height
            name
            fileName
        }
        x
        z
        lookAtX
        lookAtZ
        color
        wiki{
            _id
            name
        }
    }
`;
export const GAME_MODELS = gql`
    ${GAME_MODEL}
    fragment gameModels on Game {
        models{
            ...gameModel
        }
    }
`;
export const GAME_FOG = gql`
    fragment gameFog on FogStroke {
        _id
        path{
            _id
            x
            y
        }
        type
        size
    }
`;
export const GAME_FOG_STROKES = gql`
    ${GAME_FOG}
    fragment gameFogStrokes on Game {
        fog {
            ...gameFog
        }
    }
`;
export const GAME_ATTRIBUTES = gql`
    ${GAME_MAP}
    ${GAME_CHARACTERS}
    ${GAME_MESSAGE}
    ${GAME_STROKES}
    ${GAME_FOG_STROKES}
    ${GAME_MODELS}
    ${ACCESS_CONTROL_LIST}
    fragment gameAttributes on Game {
        _id
        ...gameMap
        host{
            _id
        }
        canPaint
        canModel
        canWriteFog
        canWrite
        canAdmin
        ...gameCharacters
        messages{
            ...gameMessage
        }
        ...gameStrokes
        ...gameFogStrokes
        ...gameModels
        ...accessControlList
    }
	
`;