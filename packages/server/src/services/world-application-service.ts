import { UnitOfWork, WorldRepository, WorldService } from "../types";
import {
	PUBLIC_WORLD_PERMISSIONS,
	WORLD_CREATE,
	WORLD_PERMISSIONS,
} from "../../../common/src/permission-constants";
import { SecurityContext } from "../security-context";
import { PLACE, WORLD } from "../../../common/src/type-constants";
import { EVERYONE, WORLD_OWNER } from "../../../common/src/role-constants";
import { World } from "../domain-entities/world";
import { Place } from "../domain-entities/place";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { FilterCondition } from "../dal/filter-condition";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { Role } from "../domain-entities/role";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { WorldAuthorizationRuleset } from "../security/world-authorization-ruleset";
import { Pin } from "../domain-entities/pin";
import { PinAuthorizationRuleset } from "../security/pin-authorization-ruleset";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class WorldApplicationService implements WorldService {
	worldAuthorizationRuleset = new WorldAuthorizationRuleset();
	pinAuthorizationRuleset = new PinAuthorizationRuleset();

	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	private makeWorld = async (
		name: string,
		isPublic: boolean,
		context: SecurityContext,
		unitOfWork: UnitOfWork
	) => {
		const world = new World("", name, "", "", [], []);
		await unitOfWork.worldRepository.create(world);
		const rootWiki = new Place("", name, world._id, "", "", "", 0);
		await unitOfWork.placeRepository.create(rootWiki);
		const rootFolder = new WikiFolder("", name, world._id, [], []);
		await unitOfWork.wikiFolderRepository.create(rootFolder);
		const placeFolder = new WikiFolder("", "Places", world._id, [rootWiki._id], []);
		await unitOfWork.wikiFolderRepository.create(placeFolder);
		const peopleFolder = new WikiFolder("", "People", world._id, [], []);
		await unitOfWork.wikiFolderRepository.create(peopleFolder);
		rootFolder.children.push(placeFolder._id, peopleFolder._id);
		await unitOfWork.wikiFolderRepository.update(rootFolder);

		world.rootFolder = rootFolder._id;
		world.wikiPage = rootWiki._id;

		const ownerPermissions = [];
		for (const permission of WORLD_PERMISSIONS) {
			const permissionAssignment = new PermissionAssignment("", permission, world._id, WORLD);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			ownerPermissions.push(permissionAssignment._id);
			context.permissions.push(permissionAssignment);
		}
		const ownerRole = new Role("", WORLD_OWNER, world._id, ownerPermissions);
		context.user.roles.push(ownerRole._id);
		await unitOfWork.userRepository.update(context.user);

		const everyonePerms = [];
		if (isPublic) {
			for (let permission of PUBLIC_WORLD_PERMISSIONS) {
				let permissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
					new FilterCondition("permission", permission),
					new FilterCondition("subjectId", world._id),
					new FilterCondition("subjectType", WORLD),
				]);
				if (!permissionAssignment) {
					permissionAssignment = new PermissionAssignment("", permission, world._id, WORLD);
					await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
				}
				everyonePerms.push(permissionAssignment._id);
				context.permissions.push(permissionAssignment);
			}
		}
		const everyoneRole = new Role("", EVERYONE, world._id, everyonePerms);

		world.roles = [ownerRole._id, everyoneRole._id];
		await unitOfWork.worldRepository.update(world);

		return world;
	};

	createWorld = async (
		name: string,
		isPublic: boolean,
		securityContext: SecurityContext
	): Promise<World> => {
		const unitOfWork = new DbUnitOfWork();
		const server = await unitOfWork.serverConfigRepository.findOne([]);
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await securityContext.hasPermission(WORLD_CREATE, server._id))) {
			throw Error(`You do not have the required permission: ${WORLD_CREATE}`);
		}
		const newWorld = await this.makeWorld(name, isPublic, securityContext, unitOfWork);
		await unitOfWork.commit();
		return newWorld;
	};

	renameWorld = async (context: SecurityContext, worldId: string, newName: string) => {
		const unitOfWork = new DbUnitOfWork();
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!(await this.worldAuthorizationRuleset.canWrite(context, world))) {
			throw new Error("You do not have permission to rename this world");
		}
		world.name = newName;
		await unitOfWork.worldRepository.update(world);
		await unitOfWork.commit();
		return world;
	};

	createPin = async (
		context: SecurityContext,
		mapId: string,
		wikiId: string,
		x: number,
		y: number
	) => {
		const unitOfWork = new DbUnitOfWork();
		const map = await unitOfWork.placeRepository.findById(mapId);
		if (!map) {
			throw new Error(`Wiki of type ${PLACE} with id ${mapId} does not exist`);
		}

		const wiki = await unitOfWork.wikiPageRepository.findById(wikiId);

		if (!wiki) {
			throw new Error(`Wiki with id ${wikiId} does not exist`);
		}
		if (!(await this.pinAuthorizationRuleset.canCreate(context, map))) {
			throw new Error(`You do not have permission to add pins to this map`);
		}

		const newPin = new Pin("", x, y, mapId, wikiId);
		await unitOfWork.pinRepository.create(newPin);
		const world = await unitOfWork.worldRepository.findById(map.world);
		world.pins.push(newPin._id);
		await unitOfWork.worldRepository.update(world);
		await unitOfWork.commit();
		return world;
	};

	updatePin = async (context: SecurityContext, pinId: string, pageId: string) => {
		const unitOfWork = new DbUnitOfWork();
		const pin = await unitOfWork.pinRepository.findById(pinId);
		if (!pin) {
			throw new Error(`Pin ${pinId} does not exist`);
		}

		if (!(await this.pinAuthorizationRuleset.canRead(context, pin))) {
			throw new Error(`You do not have permission to update this pin`);
		}

		let page = null;
		if (pageId) {
			page = await unitOfWork.wikiPageRepository.findById(pageId);
			if (!page) {
				throw new Error(`Wiki page does not exist for id ${pageId}`);
			}
		}

		pin.page = pageId;
		await unitOfWork.pinRepository.update(pin);
		const map = await unitOfWork.placeRepository.findById(pin.map);
		const world = await unitOfWork.worldRepository.findById(map.world);
		await unitOfWork.commit();
		return world;
	};

	deletePin = async (context: SecurityContext, pinId: string) => {
		const unitOfWork = new DbUnitOfWork();
		const pin = await unitOfWork.pinRepository.findById(pinId);
		if (!pin) {
			throw new Error(`Pin ${pinId} does not exist`);
		}

		if (!(await this.pinAuthorizationRuleset.canWrite(context, pin))) {
			throw new Error(`You do not have permission to delete this pin`);
		}

		await unitOfWork.pinRepository.delete(pin);
		const map = await unitOfWork.placeRepository.findById(pin.map);
		const world = await unitOfWork.worldRepository.findById(map.world);
		await unitOfWork.commit();
		return world;
	};

	getWorld = async (context: SecurityContext, worldId: string) => {
		const world = await this.worldRepository.findById(worldId);

		if (!world) {
			return null;
		}
		if (!(await this.worldAuthorizationRuleset.canRead(context, world))) {
			return null;
		}

		return world;
	};

	getWorlds = async (context: SecurityContext, page: number) => {
		const results = await this.worldRepository.findPaginated([], page);
		const docs = [];
		for (let world of results.docs) {
			if (await this.worldAuthorizationRuleset.canRead(context, world)) {
				docs.push(world);
			}
		}
		results.docs = docs;
		return results;
	};
}
