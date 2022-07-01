import { EntityAuthorizationRuleset } from "../../types";
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
import { World } from "../../domain-entities/world";
import { injectable } from "inversify";

@injectable()
export class GameAuthorizationRuleset implements EntityAuthorizationRuleset<Game, World> {
	canAdmin = async (context: SecurityContext, entity: Game): Promise<boolean> => {
		return (
			context.hasPermission(GAME_ADMIN, entity._id) ||
			context.hasPermission(GAME_ADMIN_ALL, entity.world)
		);
	};

	canCreate = async (context: SecurityContext, entity: World): Promise<boolean> => {
		return context.hasPermission(GAME_RW, entity._id);
	};

	canRead = async (context: SecurityContext, entity: Game): Promise<boolean> => {
		return context.hasPermission(GAME_READ, entity._id) || this.canWrite(context, entity);
	};

	canWrite = async (context: SecurityContext, entity: Game): Promise<boolean> => {
		return context.hasPermission(GAME_RW, entity._id);
	};

	userCanPaint = async function (context: SecurityContext, entity: Game) {
		return context.hasPermission(GAME_PAINT, entity._id);
	};

	userCanModel = async function (context: SecurityContext, entity: Game) {
		return context.hasPermission(GAME_MODEL, entity._id);
	};

	userCanWriteFog = async function (context: SecurityContext, entity: Game) {
		return context.hasPermission(GAME_FOG_WRITE, entity._id);
	};
}
