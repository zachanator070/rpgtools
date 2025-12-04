import {DbEngine} from "../../types.js";
import {injectable} from "inversify";
import {Sequelize} from "sequelize";
import pg from 'pg';
import AbstractSqlDbEngine from "./abstract-sql-db-engine.js";
import cls from 'cls-hooked';
const namespace = cls.createNamespace('rpgtools');
Sequelize.useCLS(namespace);

@injectable()
export default class PostgresDbEngine extends AbstractSqlDbEngine implements DbEngine {

    user = process.env.POSTGRES_USER || 'rpgtools';
    password = process.env.POSTGRES_PASSWORD || 'password';
    host = process.env.POSTGRES_HOST || 'postgres';
    dbName = process.env.POSTGRES_DB_NAME || 'rpgtools';

    stdOutLogging = process.env.SQL_LOGGING || 'false';

    getConnectionString(): string {
        return `postgres://${this.user}:${this.password}@${this.host}:5432/${this.dbName}`;
    }

    getRedactedConnectionString(): string {
        return `postgres://${this.user}:********@${this.host}:5432/${this.dbName}`;
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

}