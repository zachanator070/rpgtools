import {
	PermissionAssignmentFactory,
	PinFactory,
	PlaceFactory,
	RoleFactory,
	UnitOfWork,
	WikiFolderFactory,
	WorldFactory,
} from "../types";
import {
	PUBLIC_WORLD_PERMISSIONS,
	WORLD_CREATE,
	WORLD_PERMISSIONS,
} from "@rpgtools/common/src/permission-constants";
import { SecurityContext } from "../security/security-context";
import { PLACE, WORLD } from "@rpgtools/common/src/type-constants";
import { EVERYONE, WORLD_OWNER } from "@rpgtools/common/src/role-constants";
import { World } from "../domain-entities/world";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../dal/filter-condition";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class WorldService {

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
		securityContext: SecurityContext,
		unitOfWork: UnitOfWork
	): Promise<World> => {
		const server = await unitOfWork.serverConfigRepository.findOne([]);
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await securityContext.hasPermission(WORLD_CREATE, server._id))) {
			throw Error(`You do not have the required permission: ${WORLD_CREATE}`);
		}
		return  this.makeWorld(name, isPublic, securityContext, unitOfWork);
	};

	renameWorld = async (context: SecurityContext, worldId: string, newName: string, unitOfWork: UnitOfWork) => {
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!(await world.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to rename this world");
		}
		world.name = newName;
		await unitOfWork.worldRepository.update(world);
		return world;
	};

	createPin = async (
		context: SecurityContext,
		mapId: string,
		wikiId: string,
		x: number,
		y: number,
		unitOfWork: UnitOfWork
	) => {
		const map = await unitOfWork.placeRepository.findById(mapId);
		if (!map) {
			throw new Error(`Wiki of type ${PLACE} with id ${mapId} does not exist`);
		}

		if (wikiId) {
			const wiki = await unitOfWork.wikiPageRepository.findById(wikiId);

			if (!wiki) {
				throw new Error(`Wiki with id ${wikiId} does not exist`);
			}
		}

		const newPin = this.pinFactory({_id: null, x, y, map: mapId, page: wikiId});

		if (!(await newPin.authorizationPolicy.canCreate(context))) {
			throw new Error(`You do not have permission to add pins to this map`);
		}

		await unitOfWork.pinRepository.create(newPin);
		const world = await unitOfWork.worldRepository.findById(map.world);
		world.pins.push(newPin._id);
		await unitOfWork.worldRepository.update(world);
		return world;
	};

	updatePin = async (context: SecurityContext, pinId: string, pageId: string, unitOfWork: UnitOfWork) => {
		const pin = await unitOfWork.pinRepository.findById(pinId);
		if (!pin) {
			throw new Error(`Pin ${pinId} does not exist`);
		}

		if (!(await pin.authorizationPolicy.canRead(context))) {
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
		return unitOfWork.worldRepository.findById(map.world);
	};

	deletePin = async (context: SecurityContext, pinId: string, unitOfWork: UnitOfWork) => {
		const pin = await unitOfWork.pinRepository.findById(pinId);
		if (!pin) {
			throw new Error(`Pin ${pinId} does not exist`);
		}

		if (!(await pin.authorizationPolicy.canWrite(context))) {
			throw new Error(`You do not have permission to delete this pin`);
		}

		await unitOfWork.pinRepository.delete(pin);
		const map = await unitOfWork.placeRepository.findById(pin.map);
		const world = await unitOfWork.worldRepository.findById(map.world);
		world.pins = world.pins.filter(worldPinId => worldPinId !== pinId);
		await unitOfWork.worldRepository.update(world);
		return world;
	};

	getWorld = async (context: SecurityContext, worldId: string, unitOfWork: UnitOfWork) => {
		const world = await unitOfWork.worldRepository.findById(worldId);

		if (!world) {
			return null;
		}
		if (!(await world.authorizationPolicy.canRead(context))) {
			return null;
		}

		return world;
	};

	getWorlds = async (context: SecurityContext, name: string, page: number, unitOfWork: UnitOfWork) => {
		const conditions = [];
		if (name) {
			conditions.push(new FilterCondition('name', name, FILTER_CONDITION_REGEX));
		}
		const results = await unitOfWork.worldRepository.findPaginated(conditions, page);
		const docs = [];
		for (let world of results.docs) {
			if (await world.authorizationPolicy.canRead(context)) {
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
		const world = this.worldFactory({_id: null, name, wikiPage: null, rootFolder: null, roles: [], pins: []});
		await unitOfWork.worldRepository.create(world);
		const rootWiki = this.placeFactory({_id: null, name, world: world._id, coverImage: null, contentId: null, mapImage: null, pixelsPerFoot: 0});
		await unitOfWork.placeRepository.create(rootWiki);
		const rootFolder = this.wikiFolderFactory({_id: null, name, world: world._id, pages: [], children: []});
		await unitOfWork.wikiFolderRepository.create(rootFolder);
		const placeFolder = this.wikiFolderFactory({_id: null, name: "Places", world: world._id, pages: [rootWiki._id], children: []});
		await unitOfWork.wikiFolderRepository.create(placeFolder);
		const peopleFolder = this.wikiFolderFactory({_id: null, name: "People", world:  world._id, pages: [], children: []});
		await unitOfWork.wikiFolderRepository.create(peopleFolder);
		rootFolder.children.push(placeFolder._id, peopleFolder._id);
		await unitOfWork.wikiFolderRepository.update(rootFolder);

		world.rootFolder = rootFolder._id;
		world.wikiPage = rootWiki._id;

		const ownerPermissions = [];
		for (const permission of WORLD_PERMISSIONS) {
			const permissionAssignment = this.permissionAssignmentFactory(
				{
					_id: null,
					permission,
					subject: world._id,
					subjectType: WORLD
				}
			);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			ownerPermissions.push(permissionAssignment._id);
			context.permissions.push(permissionAssignment);
		}
		const ownerRole = this.roleFactory({_id: null, name: WORLD_OWNER, world: world._id, permissions: ownerPermissions});
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
						{
							_id: null,
							permission,
							subject: world._id,
							subjectType: WORLD
						}
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
