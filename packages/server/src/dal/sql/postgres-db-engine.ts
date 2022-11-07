import {DbEngine} from "../../types";
import {injectable} from "inversify";
import {Sequelize} from "sequelize";
import {DatabaseSession} from "../database-session";
import AclEntryModel from "./models/acl-entry-model";
import ArticleModel from "./models/article-model";
import ChunkModel from "./models/chunk-model";
import FileModel from "./models/file-model";
import GameModel from "./models/game-model";
import CharacterAttributeModel from "./models/game/character-attribute-model";
import CharacterModel from "./models/game/character-model";
import FogStrokeModel from "./models/game/fog-stroke-model";
import InGameModelModel from "./models/game/in-game-model-model";
import MessageModel from "./models/game/message-model";
import PathNodeModel from "./models/game/path-node-model";
import StrokeModel from "./models/game/stroke-model";
import ImageModel from "./models/image-model";
import ItemModel from "./models/item-model";
import ModelModel from "./models/model-model";
import MonsterModel from "./models/monster-model";
import PersonModel from "./models/person-model";
import PinModel from "./models/pin-model";
import PlaceModel from "./models/place-model";
import {RoleModel} from "./models/role-model";
import ServerConfigModel from "./models/server-config-model";
import UserModel from "./models/user-model";
import WikiFolderModel from "./models/wiki-folder-model";
import WorldModel from "./models/world-model";
import {modeledWikiAttributes} from "./models/modeled-wiki-model";
import pg from 'pg';
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
    USER, WIKI_FOLDER, WIKI_PAGE, WORLD
} from "@rpgtools/common/src/type-constants";
import WikiPageModel from "./models/wiki-page-model";
import RegisterCodeModel from "./models/register-code-model";

@injectable()
export default class PostgresDbEngine implements DbEngine {

    connection: Sequelize;

    user = process.env.POSTGRES_USER || 'rpgtools';
    password = process.env.POSTGRES_PASSWORD || 'password';
    host = process.env.POSTGRES_HOST || 'postgres';
    dbName = process.env.POSTGRES_DB_NAME || 'rpgtools';

    async clearDb(): Promise<void> {
        await this.connection.drop();
    }

    async connect(): Promise<void> {
        console.log(`Connecting to postgres database ${this.getRedactedConnectionString()}`)
        await this.createDatabaseIfNeeded(this.dbName);
        this.connection = new Sequelize(
            this.getConnectionString(),
            {
                logging: false
            }
        );

        // Is there any better way to do this? How to handle a bunch of static methods with the same signature?
        // This violates the open/closed principle
        AclEntryModel.init(AclEntryModel.attributes, {sequelize: this.connection, modelName: ACL_ENTRY});
        WikiPageModel.init(WikiPageModel.attributes, {sequelize: this.connection, modelName: WIKI_PAGE});
        ArticleModel.init(ArticleModel.attributes, {sequelize: this.connection, modelName: ARTICLE});
        ChunkModel.init(ChunkModel.attributes, {sequelize: this.connection, modelName: CHUNK});
        FileModel.init(FileModel.attributes, {sequelize: this.connection, modelName: FILE});

        GameModel.init(GameModel.attributes, {sequelize: this.connection, modelName: GAME});
        CharacterAttributeModel.init(CharacterAttributeModel.attributes, {sequelize: this.connection, modelName: CHARACTER_ATTRIBUTE});
        CharacterModel.init(CharacterModel.attributes, {sequelize: this.connection, modelName: CHARACTER});
        InGameModelModel.init(InGameModelModel.attributes, {sequelize: this.connection, modelName: GAME_MODEL});
        FogStrokeModel.init(FogStrokeModel.attributes, {sequelize: this.connection, modelName: FOG_STROKE});
        MessageModel.init(MessageModel.attributes, {sequelize: this.connection, modelName: MESSAGE});
        PathNodeModel.init(PathNodeModel.attributes, {sequelize: this.connection, modelName: PATH_NODE});
        StrokeModel.init(StrokeModel.attributes, {sequelize: this.connection, modelName: STROKE});

        ImageModel.init(ImageModel.attributes, {sequelize: this.connection, modelName: IMAGE});
        ItemModel.init(modeledWikiAttributes, {sequelize: this.connection, modelName: ITEM});
        ModelModel.init(ModelModel.attributes, {sequelize: this.connection, modelName: MODEL});
        MonsterModel.init(modeledWikiAttributes, {sequelize: this.connection, modelName: MONSTER});
        PersonModel.init(modeledWikiAttributes, {sequelize: this.connection, modelName: PERSON});
        PinModel.init(PinModel.attributes, {sequelize: this.connection, modelName: PIN});
        PlaceModel.init(PlaceModel.attributes, {sequelize: this.connection, modelName: PLACE});
        RoleModel.init(RoleModel.attributes, {sequelize: this.connection, modelName: ROLE});
        ServerConfigModel.init(ServerConfigModel.attributes, {sequelize: this.connection, modelName: SERVER_CONFIG});
        RegisterCodeModel.init(RegisterCodeModel.attributes, {sequelize: this.connection, modelName: 'RegisterCode'});
        UserModel.init(UserModel.attributes, {sequelize: this.connection, modelName: USER});
        WikiFolderModel.init(WikiFolderModel.attributes, {sequelize: this.connection, modelName: WIKI_FOLDER});
        WorldModel.init(WorldModel.attributes, {sequelize: this.connection, modelName: WORLD});

        AclEntryModel.connect();

        ArticleModel.connect();
        WikiPageModel.connect();
        ChunkModel.connect();
        FileModel.connect();
        // all game models
        GameModel.connect();
        CharacterAttributeModel.connect();
        CharacterModel.connect();
        FogStrokeModel.connect();
        InGameModelModel.connect();
        MessageModel.connect();
        PathNodeModel.connect();
        StrokeModel.connect();
        ImageModel.connect();
        ItemModel.connect();
        ModelModel.connect();
        MonsterModel.connect();
        PersonModel.connect();
        PinModel.connect();
        PlaceModel.connect();
        RoleModel.connect();
        ServerConfigModel.connect();
        RegisterCodeModel.connect();
        UserModel.connect();
        WikiFolderModel.connect();
        WorldModel.connect();

        console.log('Syncing table schemas')
        await this.connection.sync({alter: true});

    }

    getConnectionString(): string {
        return `postgres://${this.user}:${this.password}@${this.host}:5432/${this.dbName}`;
    }

    getRedactedConnectionString(): string {
        return `postgres://${this.user}:********@${this.host}:5432/${this.dbName}`;
    }

    async disconnect(): Promise<void> {
        await this.connection.close();
    }

    setDbHost(host: string): void {
        this.host = host;
    }

    async changeDb(name: string): Promise<void> {
        this.dbName = name;
        if(this.connection) {
            await this.disconnect();
            await this.connect();
        }
    }

    async createDatabaseIfNeeded(name: string): Promise<void> {
        try {
            await this.executeSQL(`CREATE DATABASE "${name}"`);
            console.log(`Database ${this.dbName} created`);
        } catch (e) {
            console.log(`Database ${name} already exists`)
        }
    }

    async executeSQL(sql: string) {
        const client = new pg.Client({
            user: this.user,
            password: this.password,
            host: this.host,
            database: "postgres",
        });

        await client.connect();

        await new Promise((resolve, reject) => {
            client.query(sql, (err, res) => {
                client.end();
                if(err) {
                    reject(err);
                }
                resolve(null);
            });
        });
    }

    async createDatabaseSession(): Promise<DatabaseSession> {
        return new DatabaseSession(null, null);
    }

}