import {EntityAuthorizationPolicy} from "../../types";
import {FogStroke} from "../../domain-entities/fog-stroke.js";
import {SecurityContext} from "../security-context.js";
import {DatabaseContext} from "../../dal/database-context.js";
import {injectable} from "inversify";

@injectable()
export default class FogStrokeAuthorization implements EntityAuthorizationPolicy {

    entity: FogStroke;

    async canAdmin(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const game = await databaseContext.gameRepository.findOneById(this.entity.game);
        if(game) {
            return game.authorizationPolicy.canAdmin(context, databaseContext);
        }
    }

    async canCreate(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const game = await databaseContext.gameRepository.findOneById(this.entity.game);
        if(game) {
            return game.authorizationPolicy.userCanWriteFog(context);
        }
    }

    async canRead(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const game = await databaseContext.gameRepository.findOneById(this.entity.game);
        if(game) {
            return game.authorizationPolicy.canRead(context);
        }
    }

    async canWrite(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const game = await databaseContext.gameRepository.findOneById(this.entity.game);
        if(game) {
            return game.authorizationPolicy.userCanWriteFog(context);
        }
    }

}