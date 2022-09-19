import {
	PinFactory,
	PlaceFactory,
	RoleFactory,
	WikiFolderFactory,
	WorldFactory,
} from "../types";
import {
	PUBLIC_WORLD_PERMISSIONS,
	WORLD_CREATE,
	WORLD_PERMISSIONS,
} from "@rpgtools/common/src/permission-constants";
import { SecurityContext } from "../security/security-context";
import {PLACE, ROLE} from "@rpgtools/common/src/type-constants";
import { EVERYONE, WORLD_OWNER } from "@rpgtools/common/src/role-constants";
import { World } from "../domain-entities/world";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {PaginatedResult} from "../dal/paginated-result";
import {DatabaseContext} from "../dal/database-context";

@injectable()
export class WorldService {

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
		databaseContext: DatabaseContext
	): Promise<World> => {
		const server = await databaseContext.serverConfigRepository.findOne();
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!securityContext.hasPermission(WORLD_CREATE, server)) {
			throw Error(`You do not have the required permission: ${WORLD_CREATE}`);
		}
		return  this.makeWorld(name, isPublic, securityContext, databaseContext);
	};

	renameWorld = async (context: SecurityContext, worldId: string, newName: string, databaseContext: DatabaseContext) => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!(await world.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to rename this world");
		}
		world.name = newName;
		await databaseContext.worldRepository.update(world);
		return world;
	};

	getPins = async (
		context: SecurityContext,
		worldId: string,
		page: number,
		databaseContext: DatabaseContext
	) => {
		const pinsPage = await databaseContext.pinRepository.findByWorldPaginated(worldId, page);
		const results = [];
		for (let pin of pinsPage.docs) {
			if (await pin.authorizationPolicy.canRead(context, databaseContext)) {
				results.push(pin);
			}
		}
		return pinsPage;
	};

	createPin = async (
		context: SecurityContext,
		mapId: string,
		wikiId: string,
		x: number,
		y: number,
		databaseContext: DatabaseContext
	) => {
		const map = await databaseContext.placeRepository.findOneById(mapId);
		if (!map) {
			throw new Error(`Wiki of type ${PLACE} with id ${mapId} does not exist`);
		}

		if (wikiId) {
			const wiki = await databaseContext.wikiPageRepository.findOneById(wikiId);

			if (!wiki) {
				throw new Error(`Wiki with id ${wikiId} does not exist`);
			}
		}

		const newPin = this.pinFactory({_id: null, x, y, map: mapId, page: wikiId});

		if (!(await newPin.authorizationPolicy.canCreate(context, databaseContext))) {
			throw new Error(`You do not have permission to add pins to this map`);
		}

		await databaseContext.pinRepository.create(newPin);
		return newPin;
	};

	updatePin = async (context: SecurityContext, pinId: string, pageId: string, databaseContext: DatabaseContext) => {
		const pin = await databaseContext.pinRepository.findOneById(pinId);
		if (!pin) {
			throw new Error(`Pin ${pinId} does not exist`);
		}

		if (!(await pin.authorizationPolicy.canRead(context, databaseContext))) {
			throw new Error(`You do not have permission to update this pin`);
		}

		let page = null;
		if (pageId) {
			page = await databaseContext.wikiPageRepository.findOneById(pageId);
			if (!page) {
				throw new Error(`Wiki page does not exist for id ${pageId}`);
			}
		}

		pin.page = pageId;
		await databaseContext.pinRepository.update(pin);
		return pin;
	};

	deletePin = async (context: SecurityContext, pinId: string, databaseContext: DatabaseContext) => {
		const pin = await databaseContext.pinRepository.findOneById(pinId);
		if (!pin) {
			throw new Error(`Pin ${pinId} does not exist`);
		}

		if (!(await pin.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have permission to delete this pin`);
		}

		await databaseContext.pinRepository.delete(pin);
		return pin;
	};

	getWorld = async (context: SecurityContext, worldId: string, databaseContext: DatabaseContext) => {
		const world = await databaseContext.worldRepository.findOneById(worldId);

		if (!world) {
			return null;
		}
		if (!(await world.authorizationPolicy.canRead(context, databaseContext))) {
			return null;
		}

		return world;
	};

	getWorlds = async (context: SecurityContext, name: string, page: number, databaseContext: DatabaseContext) => {
		let results: PaginatedResult<World>;
		if (name) {
			results = await databaseContext.worldRepository.findByNamePaginated(name, page);
		} else {
			results = await databaseContext.worldRepository.findAllPaginated(page);
		}
		const docs = [];
		for (let world of results.docs) {
			if (await world.authorizationPolicy.canRead(context, databaseContext)) {
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
		databaseContext: DatabaseContext
	) => {
		const world = this.worldFactory({_id: null, name, wikiPage: null, rootFolder: null, acl: []});
		await databaseContext.worldRepository.create(world);
		const rootWiki = this.placeFactory({_id: null, name, world: world._id, coverImage: null, contentId: null, mapImage: null, pixelsPerFoot: 0, acl: []});
		await databaseContext.placeRepository.create(rootWiki);
		const rootFolder = this.wikiFolderFactory({_id: null, name, world: world._id, pages: [], children: [], acl: []});
		await databaseContext.wikiFolderRepository.create(rootFolder);
		const placeFolder = this.wikiFolderFactory({_id: null, name: "Places", world: world._id, pages: [rootWiki._id], children: [], acl: []});
		await databaseContext.wikiFolderRepository.create(placeFolder);
		const peopleFolder = this.wikiFolderFactory({_id: null, name: "People", world:  world._id, pages: [], children: [], acl: []});
		await databaseContext.wikiFolderRepository.create(peopleFolder);
		rootFolder.children.push(placeFolder._id, peopleFolder._id);
		await databaseContext.wikiFolderRepository.update(rootFolder);

		world.rootFolder = rootFolder._id;
		world.wikiPage = rootWiki._id;

		const ownerRole = this.roleFactory({_id: null, name: WORLD_OWNER, world: world._id, acl: []});
		await databaseContext.roleRepository.create(ownerRole);

		for (const permission of WORLD_PERMISSIONS) {
			world.acl.push({
				permission: permission,
				principal: ownerRole._id,
				principalType: ROLE
			});
		}

		context.roles.push(ownerRole);
		context.user.roles.push(ownerRole._id);
		await databaseContext.userRepository.update(context.user);

		const everyoneRole = await databaseContext.roleRepository.findOneByName(EVERYONE);
		if (isPublic) {
			for (let permission of PUBLIC_WORLD_PERMISSIONS) {
				world.acl.push({
					permission: permission,
					principal: everyoneRole._id,
					principalType: ROLE
				});
			}
		}
		await databaseContext.roleRepository.update(everyoneRole);
		await databaseContext.worldRepository.update(world);

		return world;
	};
}
