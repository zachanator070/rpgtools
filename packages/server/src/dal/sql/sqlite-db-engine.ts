import {injectable} from "inversify";
import {DbEngine} from "../../types.js";
import {Sequelize} from "sequelize";
import path from 'path';
import AbstractSqlDbEngine from "./abstract-sql-db-engine.js";
import cls from 'cls-hooked';
const namespace = cls.createNamespace('rpgtools');
Sequelize.useCLS(namespace);


@injectable()
export default class SqliteDbEngine extends AbstractSqlDbEngine implements DbEngine {

    host: string;

    dbName = process.env.SQLITE_DB_NAME || 'rpgtools';
    dbDirectory = process.env.SQLITE_DIRECTORY_PATH || '/opt/rpgtools/db';

    getConnectionString() {
        const dbPath = path.join(this.dbDirectory, `${this.dbName}.sqlite`);
        return `sqlite:${dbPath}`;
    }

    getRedactedConnectionString(): string {
        return this.getConnectionString();
    }

    async createDatabaseIfNeeded(name: string): Promise<void> {
    }

}