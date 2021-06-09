import { SessionContext } from "../../types";
import { container } from "../../inversify.config";
import { WorldService } from "../../services/world-application-service";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { SrdImportService } from "../../services/srd-import-application-service";

type createWorldArgs = {
	name: string;
	public: boolean;
};

export const worldMutations = {
	createWorld: async (
		_: any,
		{ name, public: isPublic }: createWorldArgs,
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.createWorld(name, isPublic, securityContext);
	},

	renameWorld: async (
		_: any,
		{ worldId, newName }: { worldId: string; newName: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.renameWorld(securityContext, worldId, newName);
	},
	createPin: async (
		_: any,
		{ mapId, x, y, wikiId }: { mapId: string; x: number; y: number; wikiId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.createPin(securityContext, mapId, wikiId, x, y);
	},
	updatePin: async (
		_: any,
		{ pinId, pageId }: { pinId: string; pageId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.updatePin(securityContext, pinId, pageId);
	},
	deletePin: async (_: any, { pinId }: { pinId: string }, { securityContext }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.deletePin(securityContext, pinId);
	},
	load5eContent: async (
		_: any,
		{
			worldId,
			creatureCodex,
			tomeOfBeasts,
		}: { worldId: string; creatureCodex: boolean; tomeOfBeasts: boolean },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<SrdImportService>(INJECTABLE_TYPES.SrdImportService);
		return await service.import5eSrd(securityContext, worldId, creatureCodex, tomeOfBeasts);
	},
};
