import {injectable} from "inversify";
import {DbEngine} from "../../types.js";
import {Sequelize} from "sequelize";
import path from 'path';
import AbstractSqlDbEngine from "./abstract-sql-db-engine.js";
import cls from 'cls-hooked';
const namespace = cls.createNamespace('rpgtools');
import fs from 'fs';
import os from 'os';
Sequelize.useCLS(namespace);


@injectable()
export default class SqliteDbEngine extends AbstractSqlDbEngine implements DbEngine {

    host: string;

    dbName = process.env.SQLITE_DB_NAME || 'rpgtools';
    dbDirectory = process.env.SQLITE_DIRECTORY_PATH || '/opt/rpgtools/db';

    constructor() {
        super();
        const OS = process.platform;
        if (OS === 'darwin') {
            if (!path.isAbsolute(this.dbDirectory)) {
                console.log(`dbDirectory is not absolute, making it relative to home directory: ${this.dbDirectory}`);
                this.dbDirectory = path.join(os.homedir(), '.rpgtools', this.dbDirectory);
            }
        }
    }

    getConnectionString() {
        const dbPath = path.join(this.dbDirectory, `${this.dbName}.sqlite`);
        return `sqlite:${dbPath}`;
    }

    getRedactedConnectionString(): string {
        return this.getConnectionString();
    }

    async createDatabaseIfNeeded(name: string): Promise<void> {
        const absPath = path.isAbsolute(this.dbDirectory) ? this.dbDirectory : path.join(process.cwd(), this.dbDirectory);
        // check if the parent folder exists
        if (!fs.existsSync(absPath)) {
            fs.mkdirSync(absPath, { recursive: true });
            console.log(`Created database directory ${absPath}`);
        }
        else {
            console.log(`Database directory ${absPath} already exists`);
        }
    }

}