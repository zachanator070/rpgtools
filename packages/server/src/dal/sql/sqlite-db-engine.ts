import {inject, injectable} from "inversify";
import {DbEngine} from "../../types";
import {Sequelize} from "sequelize";
import path from 'path';
import AbstractSqlDbEngine from "./abstract-sql-db-engine";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import {DatabaseContext} from "../database-context";
import cls from 'cls-hooked';
import SQLDatabaseContext from "./sql-database-context";
import {ArticleRepository} from "../repository/article-repository";
import {CalendarRepository} from "../repository/calendar-repository";
import {ChunkRepository} from "../repository/chunk-repository";
import EventWikiRepository from "../repository/event-wiki-repository";
import {FileRepository} from "../repository/file-repository";
import FogStrokeRepository from "../repository/fog-stroke-repository";
import {GameRepository} from "../repository/game-repository";
import {ImageRepository} from "../repository/image-repository";
import {ItemRepository} from "../repository/item-repository";
import {ModelRepository} from "../repository/model-repository";
import {MonsterRepository} from "../repository/monster-repository";
import {PersonRepository} from "../repository/person-repository";
import {PinRepository} from "../repository/pin-repository";
import {PlaceRepository} from "../repository/place-repository";
import {RoleRepository} from "../repository/role-repository";
import {ServerConfigRepository} from "../repository/server-config-repository";
import StrokeRepository from "../repository/stroke-repository";
import {UserRepository} from "../repository/user-repository";
import {WikiFolderRepository} from "../repository/wiki-folder-repository";
import {WikiPageRepository} from "../repository/wiki-page-repository";
import {WorldRepository} from "../repository/world-repository";
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