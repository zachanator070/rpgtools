import { SessionContext } from "../../types.js";
import { container } from "../../di/inversify.js";
import { INJECTABLE_TYPES } from "../../di/injectable-types.js";
import { GameService } from "../../services/game-service.js";

export const tokenIconMutations = {
	createTokenIcon: async (
		_: any,
		{ worldId, imageId }: { worldId: string; imageId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const gameService = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => gameService.createTokenIcon(securityContext, worldId, imageId, databaseContext));
	},

	deleteTokenIcon: async (
		_: any,
		{ tokenIconId }: { tokenIconId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const gameService = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => gameService.deleteTokenIcon(securityContext, tokenIconId, databaseContext));
	},
};
