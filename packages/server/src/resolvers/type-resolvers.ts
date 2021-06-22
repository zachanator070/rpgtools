import { GAME_HOST, MODEL_ADD, ROLE_ADD } from "../../../common/src/permission-constants";
import { ALL_USERS, EVERYONE } from "../../../common/src/role-constants";
import { WikiPageModel } from "../dal/mongodb/models/wiki-page";
import mongoose from "mongoose";
import { GraphQLUpload } from "graphql-upload";
import { container } from "../inversify.config";
import { INJECTABLE_TYPES } from "../injectable-types";
import { World } from "../domain-entities/world";
import {
	DataLoader,
	DomainEntity,
	RoleRepository,
	SessionContext,
	UserRepository,
	WikiFolderRepository,
} from "../types";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { FilterCondition } from "../dal/filter-condition";
import { WikiPage } from "../domain-entities/wiki-page";
import { Image } from "../domain-entities/image";
import { WikiPageAuthorizationRuleset } from "../security/wiki-page-authorization-ruleset";
import { Model } from "../domain-entities/model";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Role } from "../domain-entities/role";
import { RoleAuthorizationRuleset } from "../security/role-authorization-ruleset";
import { GameAuthorizationRuleset } from "../security/game-authorization-ruleset";
import { ModelAuthorizationRuleset } from "../security/model-authorization-ruleset";
import { User } from "../domain-entities/user";
import { Pin } from "../domain-entities/pin";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { Place } from "../domain-entities/place";
import { Chunk } from "../domain-entities/chunk";
import { ServerConfig } from "../domain-entities/server-config";
import { RepositoryMapper } from "../repository-mapper";
import { Game, InGameModel } from "../domain-entities/game";

const wikiPageInterfaceAttributes = {
	world: async (page: WikiPage) => {
		const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
		return dataLoader.getDocument(page.world);
	},
	folder: async (page: WikiPage) => {
		const repository = container.get<WikiFolderRepository>(INJECTABLE_TYPES.WikiFolderRepository);
		return repository.findOne([new FilterCondition("pages", page._id)]);
	},
	coverImage: async (page: WikiPage) => {
		const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
		return dataLoader.getDocument(page.coverImage);
	},
	canWrite: async (page: WikiPage, _: any, { securityContext }: SessionContext) => {
		return new WikiPageAuthorizationRuleset().canWrite(securityContext, page);
	},
	canAdmin: async (page: WikiPage, _: any, { securityContext }: SessionContext) => {
		return new WikiPageAuthorizationRuleset().canAdmin(securityContext, page);
	},
};

const permissionControlledInterfaceAttributes = {
	accessControlList: async (
		document: DomainEntity,
		_: any,
		{ securityContext }: SessionContext
	) => {
		return securityContext.getEntityPermissions(document._id, document.type);
	},
	canWrite: async (document: DomainEntity, _: any, { securityContext }: SessionContext) => {
		return await document.authorizationRuleset.canWrite(securityContext, document);
	},
	canAdmin: async (document: DomainEntity, _: any, { securityContext }: SessionContext) => {
		return await document.authorizationRuleset.canAdmin(securityContext, document);
	},
};

const modeledWikiAttributes = {
	model: async (document: ModeledPage, _: any, __: SessionContext) => {
		const dataLoader = container.get<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader);
		return dataLoader.getDocument(document.model);
	},
};

export const TypeResolvers = {
	World: {
		roles: async (world: World, _: any, { securityContext }: SessionContext) => {
			const dataLoader = container.get<DataLoader<Role>>(INJECTABLE_TYPES.RoleDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, world.roles);
		},
		rootFolder: async (world: World, _: any, { securityContext }: SessionContext) => {
			const dataLoader = container.get<DataLoader<WikiFolder>>(
				INJECTABLE_TYPES.WikiFolderDataLoader
			);
			return dataLoader.getPermissionControlledDocument(securityContext, world.rootFolder);
		},
		wikiPage: async (world: World, _: any, __: SessionContext) => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(world.wikiPage);
		},
		canAddRoles: async (world: World, _: any, { securityContext }: SessionContext) => {
			const ruleset = new RoleAuthorizationRuleset();
			return ruleset.canCreate(securityContext, world);
		},
		canHostGame: async (world: World, _: any, { securityContext }: SessionContext) => {
			const ruleset = new GameAuthorizationRuleset();
			return ruleset.canCreate(securityContext, world);
		},
		canAddModels: async (world: World, _: any, { securityContext }: SessionContext) => {
			const ruleset = new ModelAuthorizationRuleset();
			return ruleset.canCreate(securityContext, world);
		},
		pins: async (world: World, _: any, { securityContext }: SessionContext) => {
			const dataLoader = container.get<DataLoader<Pin>>(INJECTABLE_TYPES.PinDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, world.pins);
		},
		...permissionControlledInterfaceAttributes,
	},
	PermissionControlled: {
		__resolveType: async (subject: DomainEntity) => {
			return subject.type;
		},
	},
	User: {
		email: async (user: User, _: any, { securityContext }: SessionContext) => {
			if (user._id !== securityContext.user._id) {
				return null;
			}
			return user.email;
		},
		roles: async (user: User, _: any, { securityContext }: SessionContext) => {
			const dataLoader = container.get<DataLoader<Pin>>(INJECTABLE_TYPES.PinDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, user.roles);
		},
		permissions: async (user: User, _: any, { securityContext }: SessionContext) => {
			const dataLoader = container.get<DataLoader<PermissionAssignment>>(
				INJECTABLE_TYPES.PermissionAssignmentDataLoader
			);
			return dataLoader.getPermissionControlledDocuments(securityContext, user.permissions);
		},
		currentWorld: async (user: User, _: any, { securityContext }: SessionContext) => {
			if (user._id !== securityContext.user._id) {
				return null;
			}
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getPermissionControlledDocument(securityContext, user.currentWorld);
		},
	},
	Role: {
		permissions: async (role: Role, _: any, { securityContext }: SessionContext) => {
			const ruleset = new RoleAuthorizationRuleset();
			const dataLoader = container.get<DataLoader<PermissionAssignment>>(
				INJECTABLE_TYPES.PermissionAssignmentDataLoader
			);
			if (
				role.name === EVERYONE ||
				role.name === ALL_USERS ||
				(await ruleset.canWrite(securityContext, role)) ||
				(await securityContext.hasRole(role.name))
			) {
				return dataLoader.getDocuments(role.permissions);
			} else {
				return dataLoader.getPermissionControlledDocuments(securityContext, role.permissions);
			}
		},
		members: async (role: Role, _: any, { securityContext }: SessionContext) => {
			const ruleset = new RoleAuthorizationRuleset();
			if (
				!(await ruleset.canWrite(securityContext, role)) &&
				!(await securityContext.hasRole(role.name))
			) {
				return [];
			}
			const repository = container.get<UserRepository>(INJECTABLE_TYPES.UserRepository);
			return repository.find([new FilterCondition("roles", role._id)]);
		},
		...permissionControlledInterfaceAttributes,
	},
	WikiPage: {
		__resolveType: async (page: WikiPage) => {
			return page.type;
		},
	},
	Article: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
	},
	Person: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
		...modeledWikiAttributes,
	},
	Place: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
		mapImage: async (page: Place) => {
			const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
			return dataLoader.getDocument(page.mapImage);
		},
	},
	ModeledWiki: {
		__resolveType: async (page: ModeledPage) => {
			return page.type;
		},
	},
	Item: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
		...modeledWikiAttributes,
	},
	Monster: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
		...modeledWikiAttributes,
	},
	WikiFolder: {
		world: async (folder: WikiFolder) => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getDocument(folder.world);
		},
		children: async (folder: WikiFolder, _: any, { securityContext }: SessionContext) => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, folder.children);
		},
		...permissionControlledInterfaceAttributes,
	},
	Image: {
		world: async (image: Image) => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getDocument(image.world);
		},
		chunks: async (image: Image) => {
			const dataLoader = container.get<DataLoader<Chunk>>(INJECTABLE_TYPES.ChunkDataLoader);
			return dataLoader.getDocuments(image.chunks);
		},
		icon: async (image: Image) => {
			const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
			return dataLoader.getDocument(image.icon);
		},
	},
	Pin: {
		map: async (pin: Pin) => {
			const dataLoader = container.get<DataLoader<Place>>(INJECTABLE_TYPES.PlaceDataLoader);
			return dataLoader.getDocument(pin.map);
		},
		page: async (pin: Pin) => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(pin.page);
		},
		canWrite: async (pin: Pin, _: any, { securityContext }: SessionContext) => {
			return pin.authorizationRuleset.canWrite(securityContext, pin);
		},
	},
	ServerConfig: {
		registerCodes: async (server: ServerConfig, _: any, { securityContext }: SessionContext) => {
			if (!(await server.authorizationRuleset.canWrite(securityContext, server))) {
				return [];
			}
			return server.registerCodes;
		},
		roles: async (server: ServerConfig, _: any, { securityContext }: SessionContext) => {
			const repository = container.get<RoleRepository>(INJECTABLE_TYPES.RoleRepository);
			const roles = await repository.find([]);
			const returnRoles = [];
			for (let role of roles) {
				if (await role.authorizationRuleset.canAdmin(securityContext, role)) {
					returnRoles.push(role);
				}
			}
			return returnRoles;
		},
		...permissionControlledInterfaceAttributes,
	},
	PermissionAssignment: {
		subject: async (assignment: PermissionAssignment, _: any, __: SessionContext) => {
			const mapper = new RepositoryMapper();
			const repository = mapper.map<DomainEntity>(assignment.subjectType);
			return repository.findById(assignment.subjectId);
		},
		canWrite: async (
			assignment: PermissionAssignment,
			_: any,
			{ securityContext }: SessionContext
		) => {
			return await assignment.authorizationRuleset.canWrite(securityContext, assignment);
		},
		users: async (
			assignment: PermissionAssignment,
			_: any,
			{ securityContext }: SessionContext
		) => {
			if (!(await assignment.authorizationRuleset.canRead(securityContext, assignment))) {
				return [];
			}
			const repository = container.get<UserRepository>(INJECTABLE_TYPES.UserRepository);
			return repository.find([new FilterCondition("permissions", assignment._id)]);
		},
		roles: async (
			assignment: PermissionAssignment,
			_: any,
			{ securityContext }: SessionContext
		) => {
			if (!(await assignment.authorizationRuleset.canRead(securityContext, assignment))) {
				return [];
			}
			const repository = container.get<RoleRepository>(INJECTABLE_TYPES.RoleRepository);
			return repository.find([new FilterCondition("permissions", assignment._id)]);
		},
	},
	Game: {
		world: async (game: Game, _: any, { securityContext }: SessionContext) => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getPermissionControlledDocument(securityContext, game.world);
		},
		map: async (game: Game, _: any, { securityContext }: SessionContext) => {
			const dataLoader = container.get<DataLoader<Place>>(INJECTABLE_TYPES.PlaceDataLoader);
			return dataLoader.getDocument(game.map);
		},
		characters: async (game: Game) => {
			const dataLoader = container.get<DataLoader<User>>(INJECTABLE_TYPES.UserRepository);
			const characters = [];
			for (let character of game.characters) {
				characters.push({
					name: character.name,
					color: character.color,
					player: await dataLoader.getDocument(character.player),
					str: character.strength,
					dex: character.dexterity,
					con: character.constitution,
					int: character.intelligence,
					wis: character.wisdom,
					cha: character.charisma,
				});
			}
			return characters;
		},
		messages: async (game: Game, _: any, { securityContext }: SessionContext) => {
			return game.messages.filter(
				(message) =>
					message.receiver === securityContext.user.username || message.receiver === "all"
			);
		},
		canWriteFog: async (game: Game, _: any, { securityContext }: SessionContext) => {
			return await game.authorizationRuleset.userCanWriteFog(securityContext, game);
		},
		canPaint: async (game: Game, _: any, { securityContext }: SessionContext) => {
			return await game.authorizationRuleset.userCanPaint(securityContext, game);
		},
		canModel: async (game: Game, _: any, { securityContext }: SessionContext) => {
			return await game.authorizationRuleset.userCanModel(securityContext, game);
		},
		...permissionControlledInterfaceAttributes,
	},
	PositionedModel: {
		model: async (model: InGameModel) => {
			const dataLoader = container.get<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader);
			return dataLoader.getDocument(model.model);
		},
		wiki: async (model: InGameModel) => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(model.wiki);
		},
	},
	Model: {
		...permissionControlledInterfaceAttributes,
	},
	Upload: GraphQLUpload,
};
