import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {ApiServer, DbEngine, Factory, Seeder} from "../types";
import {RoleSeeder} from "../seeders/role-seeder";
import {ServerConfigSeeder} from "../seeders/server-config-seeder";
import {ServerConfigService} from "../services/server-config-service";
import {DbUnitOfWork} from "../dal/db-unit-of-work";

@injectable()
export default class RpgToolsServer {
    @inject(INJECTABLE_TYPES.ApiServer)
    apiServer: ApiServer;

    @inject(INJECTABLE_TYPES.DbEngine)
    dbEngine: DbEngine;

    @inject(INJECTABLE_TYPES.RoleSeeder)
    roleSeeder: RoleSeeder;
    @inject(INJECTABLE_TYPES.ServerConfigSeeder)
    serverConfigSeeder: ServerConfigSeeder;

    @inject(INJECTABLE_TYPES.ServerConfigService)
    serverConfigService: ServerConfigService;

    @inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
    dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

    async seedDB() {
        const seeders: Seeder[] = [this.serverConfigSeeder, this.roleSeeder];

        for (let seeder of seeders) {
            await seeder.seed();
        }
    };

    async start() {
        await this.dbEngine.connect();
        await this.seedDB();
        const serverConfig = await this.serverConfigService.getServerConfig(this.dbUnitOfWorkFactory({}));
        if (await this.serverConfigService.serverNeedsSetup(this.dbUnitOfWorkFactory({}))) {
            console.warn(
                `Server needs configuration! Use unlock code ${serverConfig.unlockCode} to unlock`
            );
        }
        await this.apiServer.start();
    }
}