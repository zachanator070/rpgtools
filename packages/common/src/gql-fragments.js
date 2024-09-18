"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIN_ATTRIBUTES = exports.GAME_ATTRIBUTES = exports.GAME_FOG = exports.GAME_MODELS = exports.GAME_MODEL = exports.GAME_STROKE = exports.GAME_MAP = exports.GAME_CHARACTERS = exports.GAME_MESSAGE = exports.CURRENT_WIKI_ATTRIBUTES = exports.EVENT_WIKI_ATTRIBUTES = exports.MODEL_ATTRIBUTES = exports.CURRENT_WIKI_PLACE_ATTRIBUTES = exports.SERVER_CONFIG_ROLES = exports.CURRENT_WORLD_CALENDAR = exports.CURRENT_WORLD_ROLES = exports.CURRENT_WORLD_FOLDERS = exports.CURRENT_WORLD_WIKIS = exports.ACCESS_CONTROL_LIST = exports.WIKIS_IN_FOLDER_ATTRIBUTES = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.WIKIS_IN_FOLDER_ATTRIBUTES = `
	...currentWorldWikis
	folder{
		_id
		name
	}
	world{
		_id
	}
`;
exports.ACCESS_CONTROL_LIST = (0, graphql_tag_1.default) `
    fragment accessControlList on PermissionControlled {
        ... on PermissionControlled {
            canWrite
            canAdmin
            accessControlList {
                permission
                principal {
                    ... on User {
                        _id
                        name: username
                    }
                    ... on Role {
                        _id
                        name
                    }
                }
                principalType
            }
        }
    }
`;
exports.CURRENT_WORLD_WIKIS = (0, graphql_tag_1.default) `
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
exports.CURRENT_WORLD_FOLDERS = (0, graphql_tag_1.default) `
    ${exports.ACCESS_CONTROL_LIST}
    fragment currentWorldFolders on WikiFolder {
        _id
        name
        canWrite
        canAdmin
        children{
            _id
            name
        }
        ...accessControlList
	}
`;
exports.CURRENT_WORLD_ROLES = (0, graphql_tag_1.default) `
    ${exports.ACCESS_CONTROL_LIST}
    fragment currentWorldRoles on Role {
        _id
        name
        canWrite
        canAdmin
        world{
            _id
        }
        members{
            _id
            username
        }
        ...accessControlList
    }
`;
exports.CURRENT_WORLD_CALENDAR = (0, graphql_tag_1.default) `
    ${exports.ACCESS_CONTROL_LIST}
    fragment currentWorldCalendar on Calendar {
        _id
        name
        ages {
            _id
            name
            numYears
            months {
                _id
                name
                numDays
            }
            daysOfTheWeek {
                _id
                name
            }
        }
        ...accessControlList
    }
`;
exports.SERVER_CONFIG_ROLES = (0, graphql_tag_1.default) `
    ${exports.ACCESS_CONTROL_LIST}
    fragment serverConfigRoles on ServerConfig {
        roles{
            _id
            name
            canWrite
            canAdmin
            world{
                _id
            }
            members{
                _id
                username
            }
            ...accessControlList
        }
    }
`;
exports.CURRENT_WIKI_PLACE_ATTRIBUTES = (0, graphql_tag_1.default) `
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
exports.MODEL_ATTRIBUTES = (0, graphql_tag_1.default) `
    ${exports.ACCESS_CONTROL_LIST}
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
exports.EVENT_WIKI_ATTRIBUTES = (0, graphql_tag_1.default) `
    fragment eventWikiAttributes on Event {
        _id
        name
        calendar {
            _id
            name
            ages{
                _id
                name
                numYears
                months {
                    _id
                    name
                    numDays
                }
                daysOfTheWeek {
                    _id
                    name
                }
            }
        } 
        age 
        year 
        month 
        day 
        hour
        minute 
        second
    }
`;
exports.CURRENT_WIKI_ATTRIBUTES = (0, graphql_tag_1.default) `
    ${exports.EVENT_WIKI_ATTRIBUTES}
    ${exports.CURRENT_WIKI_PLACE_ATTRIBUTES}
    ${exports.MODEL_ATTRIBUTES}
    ${exports.ACCESS_CONTROL_LIST}
    fragment currentWikiAttributes on WikiPage {
        _id
        type
        name
        content
        ... on PermissionControlled {
            ...accessControlList
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
        ... on Event {
            ...eventWikiAttributes
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
exports.GAME_MESSAGE = (0, graphql_tag_1.default) `
    fragment gameMessage on GameMessage {
        sender
        receiver
        message
        timestamp
    }
`;
exports.GAME_CHARACTERS = (0, graphql_tag_1.default) `
    fragment gameCharacters on Game {
        characters {
            _id
            name
            player {
                _id
                username
            }
            color
            attributes {
                _id
                name
                value
            }
        }
    }
`;
exports.GAME_MAP = (0, graphql_tag_1.default) `
    fragment gameMap on Place {
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
exports.GAME_STROKE = (0, graphql_tag_1.default) `
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
exports.GAME_MODEL = (0, graphql_tag_1.default) `
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
exports.GAME_MODELS = (0, graphql_tag_1.default) `
    ${exports.GAME_MODEL}
    fragment gameModels on Game {
        models{
            ...gameModel
        }
    }
`;
exports.GAME_FOG = (0, graphql_tag_1.default) `
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
exports.GAME_ATTRIBUTES = (0, graphql_tag_1.default) `
    ${exports.GAME_MAP}
    ${exports.GAME_CHARACTERS}
    ${exports.GAME_MESSAGE}
    ${exports.GAME_MODELS}
    ${exports.ACCESS_CONTROL_LIST}
    fragment gameAttributes on Game {
        _id
        map {
         ...gameMap
        }
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
        ...gameModels
        ...accessControlList
    }
	
`;
exports.PIN_ATTRIBUTES = (0, graphql_tag_1.default) `
    fragment pinAttributes on Pin {
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
