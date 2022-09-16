import {DbEngine, Factory} from "../../types";
import mongoose from "mongoose";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import MongoDbMigrationV40 from "./migrations/mongodb-migration-v40";
import {DbUnitOfWork} from "../db-unit-of-work";

@injectable()
export default class MongodbDbEngine implements DbEngine {

    @inject(INJECTABLE_TYPES.MongoDbMigrationV40)
    mongoDbMigrationV40: MongoDbMigrationV40;

    @inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
    dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

    mongodb_host = process.env.MONGODB_HOST || "mongodb";
    mongodb_db_name = process.env.MONGODB_DB_NAME || "rpgtools";

    MAX_ATTEMPTS = 10;

    async connect() {
        await this.attemptConnection(0);
        await this.migrate();
    }

    getConnectionString(): string {
        return `mongodb://${this.mongodb_host}/${this.mongodb_db_name}`;
    }

    private async attemptConnection(attempt: number = 0) {
        try {
            await new Promise<void>((resolve, reject) => {
                mongoose
                    .connect(this.getConnectionString())
                    .catch(error => {
                        console.error('Error while trying to connect');
                        reject(error);
                    })
                    .then(async () => {
                        console.log(
                            `Connected to mongodb at mongodb://${this.mongodb_host}/${this.mongodb_db_name}`
                        );
                        resolve();
                    });
            });
        } catch (e) {
            if (attempt >= this.MAX_ATTEMPTS) {
                throw e;
            }
            console.warn(e.message, e);
            await new Promise(r => setTimeout(r, 1000));
            await this.attemptConnection(attempt++);
        }
    }

    async clearDb(): Promise<void> {
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (let collection of collections) {
            try {
                await mongoose.connection.db.dropCollection(collection.name);
            } catch (e) {
                console.log(`error while clearing collections: ${e.message}`);
            }
        }
    }

    async disconnect(): Promise<void> {
        return mongoose.disconnect();
    }

    setDbHost(host: string): void {
        this.mongodb_host = host;
    }

    setDbName(name: string): void {
        this.mongodb_db_name = name;
    }

    async migrate() {
        await this.mongoDbMigrationV40.migrate(this, this.dbUnitOfWorkFactory({}));
    }
}