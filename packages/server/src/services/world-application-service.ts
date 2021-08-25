import {
	Factory,
	PermissionAssignmentFactory,
	PinFactory,
	PlaceFactory,
	RoleFactory,
	UnitOfWork,
	WikiFolderFactory,
	WorldFactory,
	WorldRepository,
	WorldService,
} from "../types";
import {
	PUBLIC_WORLD_PERMISSIONS,
	WORLD_CREATE,
	WORLD_PERMISSIONS,
} from "../../../common/src/permission-constants";
import { SecurityContext } from "../security-context";
import { PLACE, WORLD } from "../../../common/src/type-constants";
import { EVERYONE, WORLD_OWNER } from "../../../common/src/role-constants";
import { World } from "../domain-entities/world";
import { FilterCondition } from "../dal/filter-condition";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { WorldAuthorizationRuleset } from "../security/world-authorization-ruleset";
import { PinAuthorizationRuleset } from "../security/pin-authorization-ruleset";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class WorldApplicationService implements WorldService {
	@inject(INJECTABLE_TYPES.WorldAuthorizationRuleset)
	worldAuthorizationRuleset: WorldAuthorizationRuleset;
	@inject(INJECTABLE_TYPES.PinAuthorizationRuleset)
	pinAuthorizationRuleset: PinAuthorizationRuleset;

	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;
	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;
	@inject(INJECTABLE_TYPES.PinFactory)
	pinFactory: PinFactory;
	@inject(INJECTABLE_TYPES.WorldFactory)
	worldFactory: WorldFactory;
	@inject(INJECTABLE_TYPES.PlaceFactory)
	placeFactory: PlaceFactory;
	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;

	createWorld = async (
		name: string,
		isPublic: boolean,
		securityContext: SecurityContext
	): Promise<World> => {
		const unitOfWork = this.dbUnitOfWorkFactory();
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
		const unitOfWork = this.dbUnitOfWorkFactory();
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
		const unitOfWork = this.dbUnitOfWorkFactory();
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

		const newPin = this.pinFactory(null, x, y, mapId, wikiId);
		await unitOfWork.pinRepository.create(newPin);
		const world = await unitOfWork.worldRepository.findById(map.world);
		world.pins.push(newPin._id);
		await unitOfWork.worldRepository.update(world);
		await unitOfWork.commit();
		return world;
	};

	updatePin = async (context: SecurityContext, pinId: string, pageId: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
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
		const unitOfWork = this.dbUnitOfWorkFactory();
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
		world.pins = world.pins.filter(worldPinId => worldPinId !== pinId);
		await unitOfWork.worldRepository.update(world);
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

	private makeWorld = async (
		name: string,
		isPublic: boolean,
		context: SecurityContext,
		unitOfWork: UnitOfWork
	) => {
		const world = this.worldFactory(null, name, null, null, [], []);
		await unitOfWork.worldRepository.create(world);
		const rootWiki = this.placeFactory(null, name, world._id, null, null, null, 0);
		await unitOfWork.placeRepository.create(rootWiki);
		const rootFolder = this.wikiFolderFactory(null, name, world._id, [], []);
		await unitOfWork.wikiFolderRepository.create(rootFolder);
		const placeFolder = this.wikiFolderFactory(null, "Places", world._id, [rootWiki._id], []);
		await unitOfWork.wikiFolderRepository.create(placeFolder);
		const peopleFolder = this.wikiFolderFactory(null, "People", world._id, [], []);
		await unitOfWork.wikiFolderRepository.create(peopleFolder);
		rootFolder.children.push(placeFolder._id, peopleFolder._id);
		await unitOfWork.wikiFolderRepository.update(rootFolder);

		world.rootFolder = rootFolder._id;
		world.wikiPage = rootWiki._id;

		const ownerPermissions = [];
		for (const permission of WORLD_PERMISSIONS) {
			const permissionAssignment = this.permissionAssignmentFactory(
				null,
				permission,
				world._id,
				WORLD
			);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			ownerPermissions.push(permissionAssignment._id);
			context.permissions.push(permissionAssignment);
		}
		const ownerRole = this.roleFactory(null, WORLD_OWNER, world._id, ownerPermissions);
		await unitOfWork.roleRepository.create(ownerRole);
		context.user.roles.push(ownerRole._id);
		await unitOfWork.userRepository.update(context.user);

		const everyoneRole = await unitOfWork.roleRepository.findOne([new FilterCondition("name", EVERYONE)]);
		if (isPublic) {
			for (let permission of PUBLIC_WORLD_PERMISSIONS) {
				let permissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
					new FilterCondition("permission", permission),
					new FilterCondition("subjectId", world._id),
					new FilterCondition("subjectType", WORLD),
				]);
				if (!permissionAssignment) {
					permissionAssignment = this.permissionAssignmentFactory(
						null,
						permission,
						world._id,
						WORLD
					);
					await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
				}
				everyoneRole.permissions.push(permissionAssignment._id);
				context.permissions.push(permissionAssignment);
			}
		}
		await unitOfWork.roleRepository.update(everyoneRole);

		world.roles = [ownerRole._id];
		await unitOfWork.worldRepository.update(world);

		return world;
	};
}
