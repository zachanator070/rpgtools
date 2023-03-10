import {QueryInterface} from "sequelize";
import AclEntryModel from "../models/acl-entry-model";
import ArticleModel from "../models/article-model";
import WikiPageModel from "../models/wiki-page-model";
import ChunkModel from "../models/chunk-model";
import FileModel from "../models/file-model";
import GameModel from "../models/game-model";
import CharacterAttributeModel from "../models/game/character-attribute-model";
import CharacterModel from "../models/game/character-model";
import FogStrokeModel from "../models/game/fog-stroke-model";
import InGameModelModel from "../models/game/in-game-model-model";
import MessageModel from "../models/game/message-model";
import PathNodeModel from "../models/game/path-node-model";
import StrokeModel from "../models/game/stroke-model";
import ImageModel from "../models/image-model";
import ItemModel from "../models/item-model";
import ModelModel from "../models/model-model";
import MonsterModel from "../models/monster-model";
import PersonModel from "../models/person-model";
import PinModel from "../models/pin-model";
import PlaceModel from "../models/place-model";
import {RoleModel} from "../models/role-model";
import ServerConfigModel from "../models/server-config-model";
import RegisterCodeModel from "../models/register-code-model";
import UserModel from "../models/user-model";
import WikiFolderModel from "../models/wiki-folder-model";
import WorldModel from "../models/world-model";
import {
    ACL_ENTRY,
    ARTICLE,
    CHARACTER,
    CHARACTER_ATTRIBUTE,
    CHUNK,
    FILE,
    FOG_STROKE,
    GAME,
    GAME_MODEL,
    IMAGE,
    ITEM,
    MESSAGE,
    MODEL,
    MONSTER,
    PATH_NODE,
    PERSON,
    PIN,
    PLACE,
    ROLE,
    SERVER_CONFIG,
    STROKE,
    USER, WIKI_FOLDER,
    WIKI_PAGE, WORLD, REGISTER_CODE
} from "@rpgtools/common/src/type-constants";
import AdminUsersToServerConfigModel from "../models/admin-users-to-server-config-model";
import UserToRoleModel from "../models/user-to-role-model";
import WikiFolderToWikiPageModel from "../models/wiki-folder-to-wiki-page-model";

async function up({ context: queryInterface }: {context: QueryInterface}) {

    await queryInterface.createTable(WORLD, WorldModel.attributes);
    await queryInterface.createTable(ACL_ENTRY, AclEntryModel.attributes);
    await queryInterface.createTable(ARTICLE, ArticleModel.attributes);
    await queryInterface.createTable(CHARACTER_ATTRIBUTE, CharacterAttributeModel.attributes);
    await queryInterface.createTable(CHARACTER, CharacterModel.attributes);
    await queryInterface.createTable(CHUNK, ChunkModel.attributes);
    await queryInterface.createTable(FILE, FileModel.attributes);
    await queryInterface.createTable(FOG_STROKE, FogStrokeModel.attributes);
    await queryInterface.createTable(GAME_MODEL, InGameModelModel.attributes);
    await queryInterface.createTable(GAME, GameModel.attributes);
    await queryInterface.createTable(IMAGE, ImageModel.attributes);
    await queryInterface.createTable(ITEM, ItemModel.attributes);
    await queryInterface.createTable(MESSAGE, MessageModel.attributes);
    await queryInterface.createTable(MODEL, ModelModel.attributes);
    await queryInterface.createTable(MONSTER, MonsterModel.attributes);
    await queryInterface.createTable(PATH_NODE, PathNodeModel.attributes);
    await queryInterface.createTable(PERSON, PersonModel.attributes);
    await queryInterface.createTable(PIN, PinModel.attributes);
    await queryInterface.createTable(PLACE, PlaceModel.attributes);
    await queryInterface.createTable(REGISTER_CODE, RegisterCodeModel.attributes);
    await queryInterface.createTable(ROLE, RoleModel.attributes);
    await queryInterface.createTable(SERVER_CONFIG, ServerConfigModel.attributes);
    await queryInterface.createTable('AdminUsersToServerConfig', AdminUsersToServerConfigModel.attributes);
    await queryInterface.createTable(STROKE, StrokeModel.attributes);
    await queryInterface.createTable(USER, UserModel.attributes);
    await queryInterface.createTable('UserToRole', UserToRoleModel.attributes);
    await queryInterface.createTable(WIKI_FOLDER, WikiFolderModel.attributes);
    await queryInterface.createTable('WikiFolderToWikiPage', WikiFolderToWikiPageModel.attributes);
    await queryInterface.createTable(WIKI_PAGE, WikiPageModel.attributes);
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.dropTable(ACL_ENTRY);
    await queryInterface.dropTable(ARTICLE);
    await queryInterface.dropTable(CHARACTER_ATTRIBUTE);
    await queryInterface.dropTable(CHARACTER);
    await queryInterface.dropTable(CHUNK);
    await queryInterface.dropTable(FILE);
    await queryInterface.dropTable(FOG_STROKE);
    await queryInterface.dropTable(GAME_MODEL);
    await queryInterface.dropTable(GAME);
    await queryInterface.dropTable(IMAGE);
    await queryInterface.dropTable(ITEM);
    await queryInterface.dropTable(MESSAGE);
    await queryInterface.dropTable(MODEL);
    await queryInterface.dropTable(MONSTER);
    await queryInterface.dropTable(PATH_NODE);
    await queryInterface.dropTable(PERSON);
    await queryInterface.dropTable(PIN);
    await queryInterface.dropTable(PLACE);
    await queryInterface.dropTable(REGISTER_CODE);
    await queryInterface.dropTable(ROLE);
    await queryInterface.dropTable(SERVER_CONFIG);
    await queryInterface.dropTable('AdminUsersToServerConfig');
    await queryInterface.dropTable(STROKE);
    await queryInterface.dropTable(USER);
    await queryInterface.dropTable('UserToRole');
    await queryInterface.dropTable(WIKI_FOLDER);
    await queryInterface.dropTable('WikiFolderToWikiPage');
    await queryInterface.dropTable(WIKI_PAGE);
    await queryInterface.dropTable(WORLD);
}

export {up, down};