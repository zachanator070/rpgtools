"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIKI_FOLDER_PERMISSIONS = exports.FOLDER_RW_ALL_PAGES = exports.FOLDER_READ_ALL_PAGES = exports.FOLDER_RW_ALL_CHILDREN = exports.FOLDER_READ_ALL_CHILDREN = exports.FOLDER_ADMIN = exports.FOLDER_RW = exports.FOLDER_READ = exports.WIKI_PERMISSIONS = exports.WIKI_ADMIN = exports.WIKI_RW = exports.WIKI_READ = exports.ROLE_PERMISSIONS = exports.ROLE_ADMIN = exports.ROLE_RW = exports.ROLE_READ = exports.CALENDAR_PERMISSIONS = exports.CALENDAR_ADMIN = exports.CALENDAR_READ = exports.CALENDAR_RW = exports.WORLD_PERMISSIONS = exports.CALENDAR_ADMIN_ALL = exports.CALENDAR_RW_ALL = exports.CALENDAR_READ_ALL = exports.MODEL_ADMIN_ALL = exports.MODEL_RW_ALL = exports.MODEL_READ_ALL = exports.MODEL_ADD = exports.ROLE_ADMIN_ALL = exports.ROLE_RW_ALL = exports.ROLE_READ_ALL = exports.ROLE_ADD = exports.GAME_ADMIN_ALL = exports.GAME_HOST = exports.FOLDER_ADMIN_ALL = exports.FOLDER_RW_ALL = exports.FOLDER_READ_ALL = exports.WIKI_ADMIN_ALL = exports.WIKI_RW_ALL = exports.WIKI_READ_ALL = exports.WORLD_RW = exports.WORLD_ADMIN = exports.WORLD_READ = exports.SERVER_PERMISSIONS = exports.SERVER_RW = exports.SERVER_ADMIN = exports.WORLD_RW_ALL = exports.WORLD_READ_ALL = exports.WORLD_ADMIN_ALL = exports.WORLD_CREATE = void 0;
exports.SERVER_ADMIN_ROLE = exports.ANON_USERNAME = exports.getPermissionsBySubjectType = exports.PUBLIC_WORLD_PERMISSIONS = exports.ALL_PERMISSIONS = exports.GAME_PERMISSIONS = exports.GAME_RW = exports.GAME_ADMIN = exports.GAME_FOG_WRITE = exports.GAME_MODEL = exports.GAME_PAINT = exports.GAME_READ = exports.MODEL_PERMISSIONS = exports.MODEL_ADMIN = exports.MODEL_RW = exports.MODEL_READ = void 0;
const type_constants_1 = require("./type-constants");
// server permissions
exports.WORLD_CREATE = "Create world access";
exports.WORLD_ADMIN_ALL = "Able to change permissions for all worlds";
exports.WORLD_READ_ALL = "Able to read all worlds";
exports.WORLD_RW_ALL = "Able to write to any world";
exports.SERVER_ADMIN = "Able to change permissions for this server";
exports.SERVER_RW = "Able to edit this server";
exports.SERVER_PERMISSIONS = [
    exports.WORLD_CREATE,
    exports.WORLD_ADMIN_ALL,
    exports.WORLD_READ_ALL,
    exports.WORLD_RW_ALL,
    exports.SERVER_ADMIN,
    exports.SERVER_RW,
];
// world permissions
exports.WORLD_READ = "See this world in search results";
exports.WORLD_ADMIN = "Able to change permissions for this world";
exports.WORLD_RW = "Able to write to this world";
exports.WIKI_READ_ALL = "Read all wiki pages";
exports.WIKI_RW_ALL = "Write to any wiki page";
exports.WIKI_ADMIN_ALL = "Able to change permissions for any wiki pages";
exports.FOLDER_READ_ALL = "Read all wiki folders";
exports.FOLDER_RW_ALL = "Write to any wiki folder";
exports.FOLDER_ADMIN_ALL = "Able to change permissions for any folder";
exports.GAME_HOST = "Able to host games";
exports.GAME_ADMIN_ALL = "Able to change permissions for any game";
exports.ROLE_ADD = "Able to create roles in this world";
exports.ROLE_READ_ALL = "Read all roles";
exports.ROLE_RW_ALL = "Write to any role";
exports.ROLE_ADMIN_ALL = "Able to change permissions for any role";
exports.MODEL_ADD = "Able to create models in this world";
exports.MODEL_READ_ALL = "Read all models";
exports.MODEL_RW_ALL = "Write to any models";
exports.MODEL_ADMIN_ALL = "Able to change permissions for any model";
exports.CALENDAR_READ_ALL = "Read all calendars";
exports.CALENDAR_RW_ALL = "Write to any calendar";
exports.CALENDAR_ADMIN_ALL = "Able to change permissions for any calendar";
exports.WORLD_PERMISSIONS = [
    exports.WORLD_READ,
    exports.WORLD_ADMIN,
    exports.WIKI_READ_ALL,
    exports.WIKI_RW_ALL,
    exports.WIKI_ADMIN_ALL,
    exports.FOLDER_READ_ALL,
    exports.FOLDER_RW_ALL,
    exports.FOLDER_ADMIN_ALL,
    exports.GAME_HOST,
    exports.GAME_ADMIN_ALL,
    exports.ROLE_ADD,
    exports.ROLE_READ_ALL,
    exports.ROLE_RW_ALL,
    exports.ROLE_ADMIN_ALL,
    exports.MODEL_ADD,
    exports.MODEL_READ_ALL,
    exports.MODEL_RW_ALL,
    exports.MODEL_ADMIN_ALL,
    exports.WORLD_RW,
    exports.CALENDAR_READ_ALL,
    exports.CALENDAR_RW_ALL,
    exports.CALENDAR_ADMIN_ALL
];
// calendar permissions
exports.CALENDAR_RW = "Able to change this calendar definition";
exports.CALENDAR_READ = "Able to read this calendar";
exports.CALENDAR_ADMIN = "Able to change permissions for this calendar";
exports.CALENDAR_PERMISSIONS = [exports.CALENDAR_RW, exports.CALENDAR_READ, exports.CALENDAR_ADMIN];
// role permissions
exports.ROLE_READ = "Able to see members of this role";
exports.ROLE_RW = "Able to change members of this role";
exports.ROLE_ADMIN = "Able to change permissions for this role";
exports.ROLE_PERMISSIONS = [exports.ROLE_READ, exports.ROLE_RW, exports.ROLE_ADMIN];
// wiki permissions
exports.WIKI_READ = "Read access to a single wiki page";
exports.WIKI_RW = "Write access to a single wiki page";
exports.WIKI_ADMIN = "Able to change permissions for a single wiki page";
exports.WIKI_PERMISSIONS = [exports.WIKI_READ, exports.WIKI_RW, exports.WIKI_ADMIN];
// folder permissions
exports.FOLDER_READ = "Read access to a single wiki folder";
exports.FOLDER_RW = "Write access to a single wiki folder";
exports.FOLDER_ADMIN = "Able to change permissions for a single wiki folder";
exports.FOLDER_READ_ALL_CHILDREN = "Able to read any direct child folder of a wiki folder";
exports.FOLDER_RW_ALL_CHILDREN = "Able to write to any direct child folder of a wiki folder";
exports.FOLDER_READ_ALL_PAGES = "Able to read any wiki page in a wiki folder";
exports.FOLDER_RW_ALL_PAGES = "Able to write to any wiki page in a wiki folder";
exports.WIKI_FOLDER_PERMISSIONS = [
    exports.FOLDER_READ,
    exports.FOLDER_RW,
    exports.FOLDER_ADMIN,
    exports.FOLDER_READ_ALL_CHILDREN,
    exports.FOLDER_RW_ALL_CHILDREN,
    exports.FOLDER_READ_ALL_PAGES,
    exports.FOLDER_RW_ALL_PAGES,
];
// model permissions
exports.MODEL_READ = "Read access to a single model";
exports.MODEL_RW = "Edit access to a single model";
exports.MODEL_ADMIN = "Able to change permissions for a single model";
exports.MODEL_PERMISSIONS = [exports.MODEL_READ, exports.MODEL_RW, exports.MODEL_ADMIN];
// game permissions
exports.GAME_READ = "Read access to a single game";
exports.GAME_PAINT = "Access to paint in a game";
exports.GAME_MODEL = "Access to add, remove, or change models in a game";
exports.GAME_FOG_WRITE = "Access to edit fog of a single game";
exports.GAME_ADMIN = "Able to change permissions for a single game";
exports.GAME_RW = "Able to change the location for a game";
exports.GAME_PERMISSIONS = [
    exports.GAME_READ,
    exports.GAME_PAINT,
    exports.GAME_MODEL,
    exports.GAME_RW,
    exports.GAME_FOG_WRITE,
    exports.GAME_ADMIN,
];
const allPermissions = [];
exports.ALL_PERMISSIONS = allPermissions.concat(exports.SERVER_PERMISSIONS, exports.WORLD_PERMISSIONS, exports.ROLE_PERMISSIONS, exports.WIKI_PERMISSIONS, exports.WIKI_FOLDER_PERMISSIONS, exports.MODEL_PERMISSIONS, exports.GAME_PERMISSIONS, exports.CALENDAR_PERMISSIONS);
exports.PUBLIC_WORLD_PERMISSIONS = [
    exports.WIKI_READ_ALL,
    exports.FOLDER_READ_ALL,
    exports.WORLD_READ,
    exports.MODEL_READ_ALL,
];
const getPermissionsBySubjectType = (subjectType) => {
    if (subjectType === type_constants_1.ROLE) {
        return exports.ROLE_PERMISSIONS;
    }
    else if (subjectType === type_constants_1.WIKI_PAGE || type_constants_1.ALL_WIKI_TYPES.includes(subjectType)) {
        return exports.WIKI_PERMISSIONS;
    }
    else if (subjectType === type_constants_1.WORLD) {
        return exports.WORLD_PERMISSIONS;
    }
    else if (subjectType === type_constants_1.WIKI_FOLDER) {
        return exports.WIKI_FOLDER_PERMISSIONS;
    }
    else if (subjectType === type_constants_1.GAME) {
        return exports.GAME_PERMISSIONS;
    }
    else if (subjectType === type_constants_1.SERVER_CONFIG) {
        return exports.SERVER_PERMISSIONS;
    }
    else if (subjectType === type_constants_1.MODEL) {
        return exports.MODEL_PERMISSIONS;
    }
    else if (subjectType === type_constants_1.CALENDAR) {
        return exports.CALENDAR_PERMISSIONS;
    }
    return null;
};
exports.getPermissionsBySubjectType = getPermissionsBySubjectType;
exports.ANON_USERNAME = "Anonymous";
exports.SERVER_ADMIN_ROLE = "Server Admin";
