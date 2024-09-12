import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import {ApiServer, DbEngine, Seeder} from "../types";
import {RoleSeeder} from "../seeders/role-seeder.js";
import {ServerConfigSeeder} from "../seeders/server-config-seeder.js";
import {ServerConfigService} from "../services/server-config-service.js";
import {DatabaseContext} from "../dal/database-context.js";

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

    async seedDB(databaseContext: DatabaseContext): Promise<void> {
        const seeders: Seeder[] = [this.serverConfigSeeder, this.roleSeeder];

        await databaseContext.openTransaction(async () => {
            for (const seeder of seeders) {
                await seeder.seed(databaseContext);
            }
        });

    };

    async start() {
        await this.dbEngine.connect();
        const databaseContext = await this.dbEngine.createDatabaseContext();
        await this.seedDB(databaseContext);
        const serverConfig = await this.serverConfigService.getServerConfig(databaseContext);
        if (await this.serverConfigService.serverNeedsSetup(databaseContext)) {
            console.warn(
                `Server needs configuration! Use unlock code ${serverConfig.unlockCode} to unlock`
            );
        }
        await this.apiServer.start();
    }
}