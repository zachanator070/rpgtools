import {inject, injectable} from "inversify";
import {DbEngine} from "../../types";
import {DatabaseSession} from "../database-session";
import {Sequelize} from "sequelize";
import path from 'path';
import AbstractSqlDbEngine from "./abstract-sql-db-engine";
import {INJECTABLE_TYPES} from "../../di/injectable-types";


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

    async createDatabaseSession(): Promise<DatabaseSession> {
        return new DatabaseSession(null);
    }

}