import {
	ApplicationService,
	PlaceRepository,
	Repository,
	ServerConfigRepository,
	WikiFolderRepository,
	WorldRepository,
} from "../types";
import {
	PUBLIC_WORLD_PERMISSIONS,
	WORLD_CREATE,
	WORLD_PERMISSIONS,
} from "../../../common/src/permission-constants";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { AuthorizationService } from "./authorization-service";
import { SecurityContext } from "../security-context";
import { WORLD } from "../../../common/src/type-constants";
import { EVERYONE, WORLD_OWNER } from "../../../common/src/role-constants";
import { User } from "../domain-entities/user";
import { World } from "../domain-entities/world";

export class WorldService implements ApplicationService {
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: ServerConfigRepository;

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	@inject(INJECTABLE_TYPES.PlaceRepository)
	placeRepository: PlaceRepository;

	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;

	private makeWorld = async (name: string, isPublic: boolean, currentUser: User) => {
		const world = new World("", name, "", "", [], []);
		await World.create({ name, public: isPublic });
		const rootWiki = await Place.create({
			name,
			public: isPublic,
			world: world._id,
		});
		const rootFolder = await WikiFolder.create({ world: world._id, name: name });
		const placeFolder = await WikiFolder.create({
			world: world._id,
			name: "Places",
			pages: [rootWiki._id],
		});
		const peopleFolder = await WikiFolder.create({
			world: world._id,
			name: "People",
		});
		rootFolder.children.push(placeFolder, peopleFolder);
		await rootFolder.save();

		world.rootFolder = rootFolder._id;
		world.wikiPage = rootWiki._id;

		const ownerPermissions = [];
		for (const permission of WORLD_PERMISSIONS) {
			let permissionAssignment = await PermissionAssignment.findOne({
				permission: permission,
				subject: world._id,
				subjectType: WORLD,
			});
			if (!permissionAssignment) {
				permissionAssignment = await PermissionAssignment.create({
					permission: permission,
					subject: world._id,
					subjectType: WORLD,
				});
			}
			ownerPermissions.push(permissionAssignment);
		}
		const ownerRole = await Role.create({
			name: WORLD_OWNER,
			world: world._id,
			permissions: ownerPermissions,
		});
		currentUser.roles.push(ownerRole);
		await currentUser.save();

		const everyonePerms = [];
		if (isPublic) {
			for (let permission of PUBLIC_WORLD_PERMISSIONS) {
				let permissionAssignment = await PermissionAssignment.findOne({
					permission: permission,
					subject: world._id,
					subjectType: WORLD,
				});
				if (!permissionAssignment) {
					permissionAssignment = await PermissionAssignment.create({
						permission: permission,
						subject: world._id,
						subjectType: WORLD,
					});
				}
				everyonePerms.push(permissionAssignment);
			}
		}
		const everyoneRole = await Role.create({
			name: EVERYONE,
			world: world._id,
			permissions: everyonePerms,
		});

		world.roles = [ownerRole, everyoneRole];
		await world.save();

		await currentUser.recalculateAllPermissions();

		await world.populate("wikiPage").execPopulate();
		return world;
	};

	createWorld = async (
		name: string,
		isPublic: boolean,
		securityContext: SecurityContext
	): Promise<World> => {
		const server = await this.serverConfigRepository.findOne([]);
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await securityContext.hasPermission(WORLD_CREATE, server._id))) {
			throw Error(`You do not have the required permission: ${WORLD_CREATE}`);
		}

		return await this.createWorld(name, isPublic, securityContext.user);
	};
}
