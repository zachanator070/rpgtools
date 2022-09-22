import {DbEngine} from "../../types";
import {injectable} from "inversify";
import {Sequelize} from "sequelize";
import {DatabaseSession} from "../database-session";

@injectable()
export default class PostgresDbEngine implements DbEngine {

    connection: Sequelize;

    user = process.env.POSTGRES_USER;
    password = process.env.POSTGRES_PASSWORD;
    host = process.env.POSTGRES_HOST;
    dbName = process.env.POSTGRES_DB_NAME;

    async clearDb(): Promise<void> {
        await this.connection.drop();
    }

    async connect(): Promise<void> {
        this.connection = new Sequelize(this.getConnectionString());

    }

    getConnectionString(): string {
        return `postgres://${this.user}@${this.password}:${this.host}:5432/${this.dbName}`;
    }

    async disconnect(): Promise<void> {
        await this.connection.close();
    }

    setDbHost(host: string): void {
        this.host = host;
    }

    setDbName(name: string): void {
        this.dbName = name;
    }

    async createDatabaseSession(): Promise<DatabaseSession> {
        return new DatabaseSession(null, await this.connection.transaction());
    }

}