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
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.createWorld(name, isPublic, securityContext, unitOfWork);
	},

	renameWorld: async (
		_: any,
		{ worldId, newName }: { worldId: string; newName: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.renameWorld(securityContext, worldId, newName, unitOfWork);
	},
	createPin: async (
		_: any,
		{ mapId, x, y, wikiId }: { mapId: string; x: number; y: number; wikiId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.createPin(securityContext, mapId, wikiId, x, y, unitOfWork);
	},
	updatePin: async (
		_: any,
		{ pinId, pageId }: { pinId: string; pageId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.updatePin(securityContext, pinId, pageId, unitOfWork);
	},
	deletePin: async (_: any, { pinId }: { pinId: string }, { securityContext, unitOfWork }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await service.deletePin(securityContext, pinId, unitOfWork);
	},
	load5eContent: async (
		_: any,
		{
			worldId,
			creatureCodex,
			tomeOfBeasts,
		}: { worldId: string; creatureCodex: boolean; tomeOfBeasts: boolean },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<SrdImportService>(INJECTABLE_TYPES.SrdImportService);
		return await service.import5eSrd(securityContext, worldId, creatureCodex, tomeOfBeasts, unitOfWork);
	},
};
