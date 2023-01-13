import {injectable} from "inversify";
import {DbEngine} from "../../types";
import {DatabaseSession} from "../database-session";


@injectable()
export default class InMemoryDbEngine implements DbEngine {

    changeDb(name: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    clearDb(): Promise<void> {
        return Promise.resolve(undefined);
    }

    connect(): Promise<void> {
        console.warn('Using in memory database. All data will be erased when service restarts!');
        return Promise.resolve(undefined);
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    setDbHost(host: string): void {
    }

    async createDatabaseSession(): Promise<DatabaseSession> {
        return new DatabaseSession(null, null);
    }

}