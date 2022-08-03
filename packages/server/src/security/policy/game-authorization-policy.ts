import {DomainEntity, EntityAuthorizationPolicy} from "../../types";
import { Game } from "../../domain-entities/game";
import { SecurityContext } from "../security-context";
import {
	GAME_ADMIN,
	GAME_ADMIN_ALL,
	GAME_FOG_WRITE,
	GAME_MODEL,
	GAME_PAINT,
	GAME_READ,
	GAME_RW,
} from "@rpgtools/common/src/permission-constants";
import { injectable } from "inversify";

@injectable()
export class GameAuthorizationPolicy implements EntityAuthorizationPolicy<Game> {

	entity: Game;

	canAdmin = async (context: SecurityContext): Promise<boolean> => {
		return (
			context.hasPermission(GAME_ADMIN, this.entity._id) ||
			context.hasPermission(GAME_ADMIN_ALL, this.entity.world)
		);
	};

	canCreate = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(GAME_RW, this.entity._id);
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(GAME_READ, this.entity._id) || this.canWrite(context);
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(GAME_RW, this.entity._id);
	};

	userCanPaint = async (context: SecurityContext) => {
		return context.hasPermission(GAME_PAINT, this.entity._id);
	};

	userCanModel = async (context: SecurityContext) => {
		return context.hasPermission(GAME_MODEL, this.entity._id);
	};

	userCanWriteFog = async (context: SecurityContext) => {
		return context.hasPermission(GAME_FOG_WRITE, this.entity._id);
	};
}
