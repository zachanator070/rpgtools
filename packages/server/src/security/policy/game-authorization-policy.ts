import {EntityAuthorizationPolicy} from "../../types";
import { Game } from "../../domain-entities/game.js";
import { SecurityContext } from "../security-context.js";
import {
	GAME_ADMIN,
	GAME_ADMIN_ALL,
	GAME_FOG_WRITE, GAME_HOST,
	GAME_MODEL,
	GAME_PAINT,
	GAME_READ,
	GAME_RW,
} from "@rpgtools/common/src/permission-constants";
import { injectable } from "inversify";
import {DatabaseContext} from "../../dal/database-context.js";

@injectable()
export class GameAuthorizationPolicy implements EntityAuthorizationPolicy {

	entity: Game;

	canAdmin = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const world = await databaseContext.worldRepository.findOneById(this.entity.world);
		return (
			context.hasPermission(GAME_ADMIN, this.entity) ||
			context.hasPermission(GAME_ADMIN_ALL, world)
		);
	};

	canCreate = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const world = await databaseContext.worldRepository.findOneById(this.entity.world);
		return context.hasPermission(GAME_HOST, world);
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(GAME_READ, this.entity) || this.canWrite(context);
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(GAME_RW, this.entity);
	};

	userCanPaint = async (context: SecurityContext) => {
		return context.hasPermission(GAME_PAINT, this.entity);
	};

	userCanModel = async (context: SecurityContext) => {
		return context.hasPermission(GAME_MODEL, this.entity);
	};

	userCanWriteFog = async (context: SecurityContext) => {
		return context.hasPermission(GAME_FOG_WRITE, this.entity);
	};
}
