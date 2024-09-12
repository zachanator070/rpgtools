import {inject, injectable} from "inversify";
import {DbEngine} from "../../types";
import {Sequelize} from "sequelize";
import path from 'path';
import AbstractSqlDbEngine from "./abstract-sql-db-engine.js";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
import {DatabaseContext} from "../database-context.js";
import cls from 'cls-hooked';
import SQLDatabaseContext from "./sql-database-context.js";
import {ArticleRepository} from "../repository/article-repository.js";
import {CalendarRepository} from "../repository/calendar-repository.js";
import {ChunkRepository} from "../repository/chunk-repository.js";
import EventWikiRepository from "../repository/event-wiki-repository.js";
import {FileRepository} from "../repository/file-repository.js";
import FogStrokeRepository from "../repository/fog-stroke-repository.js";
import {GameRepository} from "../repository/game-repository.js";
import {ImageRepository} from "../repository/image-repository.js";
import {ItemRepository} from "../repository/item-repository.js";
import {ModelRepository} from "../repository/model-repository.js";
import {MonsterRepository} from "../repository/monster-repository.js";
import {PersonRepository} from "../repository/person-repository.js";
import {PinRepository} from "../repository/pin-repository.js";
import {PlaceRepository} from "../repository/place-repository.js";
import {RoleRepository} from "../repository/role-repository.js";
import {ServerConfigRepository} from "../repository/server-config-repository.js";
import StrokeRepository from "../repository/stroke-repository.js";
import {UserRepository} from "../repository/user-repository.js";
import {WikiFolderRepository} from "../repository/wiki-folder-repository.js";
import {WikiPageRepository} from "../repository/wiki-page-repository.js";
import {WorldRepository} from "../repository/world-repository.js";
const namespace = cls.createNamespace('rpgtools');
Sequelize.useCLS(namespace);


@injectable()
export default class SqliteDbEngine implements DbEngine {

    connection: Sequelize;

    dbName = process.env.SQLITE_DB_NAME || 'rpgtools';
    dbDirectory = process.env.SQLITE_DIRECTORY_PATH || '/opt/rpgtools/db';

    @inject(INJECTABLE_TYPES.SqlDbEngine)
    abstractEngine: AbstractSqlDbEngine;

    async changeDb(name: string): Promise<void> {
        this.dbName = name;
        if(this.connection) {
            await this.disconnect();
            await this.connect();
        }
    }

    async clearDb(): Promise<void> {
        await this.connection.drop();
    }

    getDbFilePath() {
        return path.join(this.dbDirectory, `${this.dbName}.sqlite`);
    }

    async connect(): Promise<void> {
        console.log(`Using SQLite db ${this.getDbFilePath()}`);

        this.connection = new Sequelize(`sqlite:${this.getDbFilePath()}`, {logging: false, define: {freezeTableName: true}});

        this.abstractEngine.connectAll(this.connection);

        console.log('Syncing table schemas')
        await this.abstractEngine.migrate(this.connection);
    }

    async disconnect(): Promise<void> {
        await this.connection.close();
    }

    setDbHost(host: string): void {
    }

    async createDatabaseContext(): Promise<DatabaseContext> {
        return this.abstractEngine.createDatabaseContext(this.connection);
    }

}