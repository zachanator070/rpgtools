import { QueryInterface, DataTypes, ModelAttributes, Deferrable } from "sequelize";

// server permissions
export const WORLD_CREATE = "Create world access";
export const WORLD_ADMIN_ALL = "Able to change permissions for all worlds";
export const WORLD_READ_ALL = "Able to read all worlds";
export const WORLD_RW_ALL = "Able to write to any world";
export const SERVER_ADMIN = "Able to change permissions for this server";
export const SERVER_RW = "Able to edit this server";

export const SERVER_PERMISSIONS = [
    WORLD_CREATE,
    WORLD_ADMIN_ALL,
    WORLD_READ_ALL,
    WORLD_RW_ALL,
    SERVER_ADMIN,
    SERVER_RW,
];

// world permissions
export const WORLD_READ = "See this world in search results";
export const WORLD_ADMIN = "Able to change permissions for this world";
export const WORLD_RW = "Able to write to this world";
export const WIKI_READ_ALL = "Read all wiki pages";
export const WIKI_RW_ALL = "Write to any wiki page";
export const WIKI_ADMIN_ALL = "Able to change permissions for any wiki pages";
export const FOLDER_READ_ALL = "Read all wiki folders";
export const FOLDER_RW_ALL = "Write to any wiki folder";
export const FOLDER_ADMIN_ALL = "Able to change permissions for any folder";
export const GAME_HOST = "Able to host games";
export const GAME_ADMIN_ALL = "Able to change permissions for any game";
export const ROLE_ADD = "Able to create roles in this world";
export const ROLE_READ_ALL = "Read all roles";
export const ROLE_RW_ALL = "Write to any role";
export const ROLE_ADMIN_ALL = "Able to change permissions for any role";
export const MODEL_ADD = "Able to create models in this world";
export const MODEL_READ_ALL = "Read all models";
export const MODEL_RW_ALL = "Write to any models";
export const MODEL_ADMIN_ALL = "Able to change permissions for any model";
export const CALENDAR_READ_ALL = "Read all calendars";
export const CALENDAR_RW_ALL = "Write to any calendar";
export const CALENDAR_ADMIN_ALL = "Able to change permissions for any calendar";

export const WORLD_PERMISSIONS = [
    WORLD_READ,
    WORLD_ADMIN,
    WIKI_READ_ALL,
    WIKI_RW_ALL,
    WIKI_ADMIN_ALL,
    FOLDER_READ_ALL,
    FOLDER_RW_ALL,
    FOLDER_ADMIN_ALL,
    GAME_HOST,
    GAME_ADMIN_ALL,
    ROLE_ADD,
    ROLE_READ_ALL,
    ROLE_RW_ALL,
    ROLE_ADMIN_ALL,
    MODEL_ADD,
    MODEL_READ_ALL,
    MODEL_RW_ALL,
    MODEL_ADMIN_ALL,
    WORLD_RW,
    CALENDAR_READ_ALL,
    CALENDAR_RW_ALL,
    CALENDAR_ADMIN_ALL
];

// calendar permissions

export const CALENDAR_RW = "Able to change this calendar definition";
export const CALENDAR_READ = "Able to read this calendar";
export const CALENDAR_ADMIN = "Able to change permissions for this calendar";

export const CALENDAR_PERMISSIONS = [CALENDAR_RW, CALENDAR_READ, CALENDAR_ADMIN];

// role permissions
export const ROLE_READ = "Able to see members of this role";
export const ROLE_RW = "Able to change members of this role";
export const ROLE_ADMIN = "Able to change permissions for this role";

export const ROLE_PERMISSIONS = [ROLE_READ, ROLE_RW, ROLE_ADMIN];

// wiki permissions
export const WIKI_READ = "Read access to a single wiki page";
export const WIKI_RW = "Write access to a single wiki page";
export const WIKI_ADMIN = "Able to change permissions for a single wiki page";

export const WIKI_PERMISSIONS = [WIKI_READ, WIKI_RW, WIKI_ADMIN];

// folder permissions
export const FOLDER_READ = "Read access to a single wiki folder";
export const FOLDER_RW = "Write access to a single wiki folder";
export const FOLDER_ADMIN = "Able to change permissions for a single wiki folder";
export const FOLDER_READ_ALL_CHILDREN = "Able to read any direct child folder of a wiki folder";
export const FOLDER_RW_ALL_CHILDREN = "Able to write to any direct child folder of a wiki folder";
export const FOLDER_READ_ALL_PAGES = "Able to read any wiki page in a wiki folder";
export const FOLDER_RW_ALL_PAGES = "Able to write to any wiki page in a wiki folder";

export const WIKI_FOLDER_PERMISSIONS = [
    FOLDER_READ,
    FOLDER_RW,
    FOLDER_ADMIN,
    FOLDER_READ_ALL_CHILDREN,
    FOLDER_RW_ALL_CHILDREN,
    FOLDER_READ_ALL_PAGES,
    FOLDER_RW_ALL_PAGES,
];

// model permissions
export const MODEL_READ = "Read access to a single model";
export const MODEL_RW = "Edit access to a single model";
export const MODEL_ADMIN = "Able to change permissions for a single model";

export const MODEL_PERMISSIONS = [MODEL_READ, MODEL_RW, MODEL_ADMIN];

// game permissions
export const GAME_READ = "Read access to a single game";
export const GAME_PAINT = "Access to paint in a game";
export const GAME_MODEL = "Access to add, remove, or change models in a game";
export const GAME_FOG_WRITE = "Access to edit fog of a single game";
export const GAME_ADMIN = "Able to change permissions for a single game";
export const GAME_RW = "Able to change the location for a game";

export const GAME_PERMISSIONS = [
    GAME_READ,
    GAME_PAINT,
    GAME_MODEL,
    GAME_RW,
    GAME_FOG_WRITE,
    GAME_ADMIN,
];
export const ALL_PERMISSIONS = [].concat(
    SERVER_PERMISSIONS,
    WORLD_PERMISSIONS,
    ROLE_PERMISSIONS,
    WIKI_PERMISSIONS,
    WIKI_FOLDER_PERMISSIONS,
    MODEL_PERMISSIONS,
    GAME_PERMISSIONS,
    CALENDAR_PERMISSIONS
);

const defaultAttributes: ModelAttributes = {
    _id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
};

const modeledWikiAttributes: ModelAttributes = {
    ...defaultAttributes,
    modelColor: {
        type: DataTypes.STRING,
    },
    pageModelId: {
        type: DataTypes.UUID,
        references: {
            model: 'Model',
            key: '_id'
        }
    }
};

async function up({ context: queryInterface }: { context: QueryInterface }) {

    await queryInterface.createTable('World', {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        wikiPageId: {
            type: DataTypes.UUID,
        }
    });
    await queryInterface.createTable('WikiFolder', {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        WikiFolderId: {
            type: DataTypes.UUID,
            references: {
                model: 'WikiFolder',
                key: '_id'
            }
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        }
    });
    await queryInterface.addColumn('World', 'rootFolderId', {
        type: DataTypes.UUID,
        references: {
            model: 'WikiFolder',
            key: '_id'
        }
    });
    await queryInterface.createTable('AclEntry', {
        ...defaultAttributes,
        permission: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [ALL_PERMISSIONS],
                    msg: `permission must be one of the following values: ${ALL_PERMISSIONS}`
                }
            }
        },
        principalType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['User', 'Role']],
                    msg: `principalType must be one of the following values: ${['User', 'Role']}`
                }
            }
        },
        principal: {
            type: DataTypes.UUID
        },
        subject: {
            type: DataTypes.UUID
        }
    });
    await queryInterface.createTable('Image', {
        ...defaultAttributes,
        width: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        height: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        chunkWidth: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        chunkHeight: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        },
        iconId: {
            type: DataTypes.UUID,
            references: {
                model: 'Image',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('Article', {
        ...defaultAttributes
    });
    await queryInterface.createTable('Place', {
        ...defaultAttributes,
        pixelsPerFoot: {
            type: DataTypes.INTEGER
        },
        mapImageId: {
            type: DataTypes.UUID,
            references: {
                model: 'Image',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('User', {
        ...defaultAttributes,
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                not: { args: 'Anonymous', msg: 'cannot save anonymous user' }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tokenVersion: {
            type: DataTypes.STRING,
        },
        currentWorldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('Game', {
        ...defaultAttributes,
        passwordHash: {
            type: DataTypes.STRING
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        },
        mapId: {
            type: DataTypes.UUID,
            references: {
                model: 'Place',
                key: '_id'
            }
        },
        hostId: {
            type: DataTypes.UUID,
            references: {
                model: 'User',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('Character', {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: 'Game',
                key: '_id'
            }
        },
        playerId: {
            type: DataTypes.UUID,
            references: {
                model: 'User',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('CharacterAttribute', {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        CharacterId: {
            type: DataTypes.UUID,
            references: {
                model: 'Character',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('File', {
        ...defaultAttributes,
        content: {
            type: DataTypes.BLOB,
            allowNull: false
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mimeType: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    await queryInterface.createTable('Chunk', {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        width: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        height: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        fileId: {
            type: DataTypes.UUID,
            references: {
                model: 'File',
                key: '_id'
            }
        },
        imageId: {
            type: DataTypes.UUID,
            references: {
                model: 'Image',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('FogStroke', {
        ...defaultAttributes,
        size: {
            type: DataTypes.FLOAT,
        },
        strokeType: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [["fog", "erase"]],
                    msg: `type is not one of the following values: ${["fog", "erase"]}`
                }
            }
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: 'Game',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('Model', {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        depth: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        width: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        height: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: false
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        },
        fileId: {
            type: DataTypes.UUID,
            references: {
                model: 'File',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('GameModel', {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        z: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        lookAtX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        lookAtZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: 'Game',
                key: '_id'
            }
        },
        modelId: {
            type: DataTypes.UUID,
            references: {
                model: 'Model',
                key: '_id'
            }
        },
        wikiId: {
            type: DataTypes.UUID,
        }
    });
    await queryInterface.createTable('Item', {
        ...modeledWikiAttributes
    });
    await queryInterface.createTable('Message', {
        ...defaultAttributes,
        sender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        senderUser: {
            type: DataTypes.STRING,
            allowNull: false
        },
        receiver: {
            type: DataTypes.STRING,
            allowNull: false
        },
        receiverUser: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        timestamp: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: 'Game',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('Monster', {
        ...modeledWikiAttributes
    });
    await queryInterface.createTable('Stroke', {
        ...defaultAttributes,
        color: {
            type: DataTypes.STRING,
        },
        size: {
            type: DataTypes.FLOAT,
        },
        fill: {
            type: DataTypes.BOOLEAN
        },
        strokeType: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [["circle", "square", "erase", "line"]],
                    msg: `type is not one of the following values: ${["circle", "square", "erase", "line"]}`
                }
            }
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: 'Game',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('PathNode', {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        FogStrokeId: {
            type: DataTypes.UUID,
            references: {
                model: 'FogStroke',
                key: '_id'
            }
        },
        StrokeId: {
            type: DataTypes.UUID,
            references: {
                model: 'Stroke',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('Person', {
        ...modeledWikiAttributes
    });
    await queryInterface.createTable('WikiPage', {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contentId: {
            type: DataTypes.UUID
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        wiki: {
            type: DataTypes.UUID,
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        },
        coverImageId: {
            type: DataTypes.UUID,
            references: {
                model: 'Image',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('Pin', {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        mapId: {
            type: DataTypes.UUID,
            references: {
                model: 'WikiPage',
                key: '_id'
            }
        },
        pageId: {
            type: DataTypes.UUID,
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('ServerConfig', {
        ...defaultAttributes,
        version: {
            type: DataTypes.STRING,
            allowNull: false
        },
        unlockCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        defaultWorldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('RegisterCode', {
        ...defaultAttributes,
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ServerConfigId: {
            type: DataTypes.UUID,
            references: {
                model: 'ServerConfig',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('Role', {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: 'World',
                key: '_id'
            }
        }
    });
    await queryInterface.createTable('AdminUsersToServerConfig', {
        ServerConfigId: {
            type: DataTypes.UUID
        },
        UserId: {
            type: DataTypes.UUID
        },
        createdAt: {
            type: DataTypes.TIME
        },
        updatedAt: {
            type: DataTypes.TIME
        }
    });
    await queryInterface.createTable('UserToRole', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserId: {
            type: DataTypes.UUID,
            references: {
                model: 'User',
                key: '_id'
            }
        },
        RoleId: {
            type: DataTypes.UUID,
            references: {
                model: 'Role',
                key: '_id'
            }
        },
        createdAt: {
            type: DataTypes.TIME
        },
        updatedAt: {
            type: DataTypes.TIME
        }
    });
    await queryInterface.createTable('WikiFolderToWikiPage', {
        WikiFolderId: {
            type: DataTypes.UUID,
        },
        WikiPageId: {
            type: DataTypes.UUID,
        },
        createdAt: {
            type: DataTypes.TIME
        },
        updatedAt: {
            type: DataTypes.TIME
        }
    });
}

async function down({ context: queryInterface }: { context: QueryInterface }) {
    await queryInterface.dropTable('AclEntry');
    await queryInterface.dropTable('Article');
    await queryInterface.dropTable('CharacterAttribute');
    await queryInterface.dropTable('Character');
    await queryInterface.dropTable('Chunk');
    await queryInterface.dropTable('File');
    await queryInterface.dropTable('FogStroke');
    await queryInterface.dropTable('GameModel');
    await queryInterface.dropTable('Game');
    await queryInterface.dropTable('Image');
    await queryInterface.dropTable('Item');
    await queryInterface.dropTable('Message');
    await queryInterface.dropTable('Model');
    await queryInterface.dropTable('Monster');
    await queryInterface.dropTable('PathNode');
    await queryInterface.dropTable('Person');
    await queryInterface.dropTable('Pin');
    await queryInterface.dropTable('Place');
    await queryInterface.dropTable('RegisterCode');
    await queryInterface.dropTable('Role');
    await queryInterface.dropTable('ServerConfig');
    await queryInterface.dropTable('AdminUsersToServerConfig');
    await queryInterface.dropTable('Stroke');
    await queryInterface.dropTable('User');
    await queryInterface.dropTable('UserToRole');
    await queryInterface.dropTable('WikiFolder');
    await queryInterface.dropTable('WikiFolderToWikiPage');
    await queryInterface.dropTable('WikiPage');
    await queryInterface.dropTable('World');
}

export { up, down };