import {EntityAuthorizationPolicy} from "../../types";
import {Stroke} from "../../domain-entities/stroke";
import {SecurityContext} from "../security-context";
import {DatabaseContext} from "../../dal/database-context";
import {injectable} from "inversify";


@injectable()
export default class StrokeAuthorizationPolicy implements EntityAuthorizationPolicy {

    entity: Stroke;

    async canAdmin(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const game = await databaseContext.gameRepository.findOneById(this.entity.game);
        if(game) {
            return game.authorizationPolicy.canAdmin(context, databaseContext);
        }
    }

    async canCreate(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const game = await databaseContext.gameRepository.findOneById(this.entity.game);
        if(game) {
            return game.authorizationPolicy.userCanPaint(context);
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
            return game.authorizationPolicy.userCanPaint(context);
        }
    }
}