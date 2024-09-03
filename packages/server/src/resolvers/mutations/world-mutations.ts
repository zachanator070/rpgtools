import { SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import {WorldService} from "../../services/world-service";
import {Age} from "../../domain-entities/calendar";
import {ContentImportService} from "../../services/content-import-service";

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
		return await databaseContext.openTransaction(async () => service.createWorld(name, isPublic, securityContext, databaseContext));
	},

	renameWorld: async (
		_: any,
		{ worldId, newName }: { worldId: string; newName: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await databaseContext.openTransaction(async () => service.renameWorld(securityContext, worldId, newName, databaseContext));
	},
	createPin: async (
		_: any,
		{ mapId, x, y, wikiId }: { mapId: string; x: number; y: number; wikiId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await databaseContext.openTransaction(async () => service.createPin(securityContext, mapId, wikiId, x, y, databaseContext));
	},
	updatePin: async (
		_: any,
		{ pinId, pageId }: { pinId: string; pageId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await databaseContext.openTransaction(async () => service.updatePin(securityContext, pinId, pageId, databaseContext));
	},
	deletePin: async (_: any, { pinId }: { pinId: string }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await databaseContext.openTransaction(async () => service.deletePin(securityContext, pinId, databaseContext));
	},
	load5eContent: async (
		_: any,
		{
			worldId,
		}: { worldId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<ContentImportService>(INJECTABLE_TYPES.ContentImportService);
		return await databaseContext.openTransaction(async () => service.import5eSrd(securityContext, worldId, databaseContext));
	},
	upsertCalendar: async (
		_: any,
		{calendarId, world, name, ages}: { calendarId: string, world: string, name: string, ages: Age[] },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await databaseContext.openTransaction(async () => service.upsertCalendar(calendarId, world, name, ages, securityContext, databaseContext));
	},
	deleteCalendar: async (
		_: any,
		{calendarId}: {calendarId: string},
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return await databaseContext.openTransaction(async () => service.deleteCalendar(calendarId, securityContext, databaseContext));
	},
};
