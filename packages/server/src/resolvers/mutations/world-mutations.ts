import { SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import {WorldService} from "../../services/world-service";
import {SrdImportService} from "../../services/srd-import-service";

interface createWorldArgs {
	name: string;
	public: boolean;
}

export const worldMutations = {
	createWorld: async (
		_: any,
		{ name, public: isPublic }: createWorldArgs,
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.createWorld(name, isPublic, securityContext, databaseContext);
	},

	renameWorld: async (
		_: any,
		{ worldId, newName }: { worldId: string; newName: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.renameWorld(securityContext, worldId, newName, databaseContext);
	},
	createPin: async (
		_: any,
		{ mapId, x, y, wikiId }: { mapId: string; x: number; y: number; wikiId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.createPin(securityContext, mapId, wikiId, x, y, databaseContext);
	},
	updatePin: async (
		_: any,
		{ pinId, pageId }: { pinId: string; pageId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.updatePin(securityContext, pinId, pageId, databaseContext);
	},
	deletePin: async (_: any, { pinId }: { pinId: string }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.deletePin(securityContext, pinId, databaseContext);
	},
	load5eContent: async (
		_: any,
		{
			worldId,
			creatureCodex,
			tomeOfBeasts,
		}: { worldId: string; creatureCodex: boolean; tomeOfBeasts: boolean },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<SrdImportService>(INJECTABLE_TYPES.SrdImportService);
		return await service.import5eSrd(securityContext, worldId, creatureCodex, tomeOfBeasts, databaseContext);
	},
};
