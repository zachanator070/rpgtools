import {DbEngine} from "../../types";
import {inject, injectable} from "inversify";
import {Sequelize} from "sequelize";
import {DatabaseSession} from "../database-session";
import pg from 'pg';
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AbstractSqlDbEngine from "./abstract-sql-db-engine";

@injectable()
export default class PostgresDbEngine implements DbEngine {

    connection: Sequelize;

    user = process.env.POSTGRES_USER || 'rpgtools';
    password = process.env.POSTGRES_PASSWORD || 'password';
    host = process.env.POSTGRES_HOST || 'postgres';
    dbName = process.env.POSTGRES_DB_NAME || 'rpgtools';

    stdOutLogging = process.env.POSTGRES_SQL_LOGGING || 'false';

    @inject(INJECTABLE_TYPES.SqlDbEngine)
    abstractEngine: AbstractSqlDbEngine;

    async clearDb(): Promise<void> {
        await this.connection.drop();
    }

    async connect(): Promise<void> {
        console.log(`Connecting to postgres database ${this.getRedactedConnectionString()}`)
        await this.createDatabaseIfNeeded(this.dbName);
        this.connection = new Sequelize(
            this.getConnectionString(),
            {
                logging: this.stdOutLogging.toLowerCase() === 'true' && console.log
            }
        );

        this.abstractEngine.connectAll(this.connection);

        console.log('Syncing table schemas');
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