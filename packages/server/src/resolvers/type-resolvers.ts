import {EVERYONE, LOGGED_IN} from "../../../common/src/role-constants";
import { GraphQLUpload } from "graphql-upload";
import { container } from "../inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { World } from "../domain-entities/world";
import {
	DataLoader,
	DomainEntity, FileRepository,
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
import {Game, InGameModel, Message} from "../domain-entities/game";

const wikiPageInterfaceAttributes = {
	world: async (page: WikiPage): Promise<World> => {
		const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
		return dataLoader.getDocument(page.world);
	},
	folder: async (page: WikiPage): Promise<WikiFolder> => {
		const repository = container.get<WikiFolderRepository>(INJECTABLE_TYPES.WikiFolderRepository);
		return repository.findOne([new FilterCondition("pages", page._id)]);
	},
	coverImage: async (page: WikiPage): Promise<Image> => {
		const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
		if(page.coverImage){
			return dataLoader.getDocument(page.coverImage);
		}
	},
	canWrite: async (page: WikiPage, _: any, { securityContext }: SessionContext): Promise<boolean> => {
		const ruleset = container.get<WikiPageAuthorizationRuleset>(
			INJECTABLE_TYPES.WikiPageAuthorizationRuleset
		);
		return ruleset.canWrite(securityContext, page);
	},
	canAdmin: async (page: WikiPage, _: any, { securityContext }: SessionContext): Promise<boolean> => {
		const ruleset = container.get<WikiPageAuthorizationRuleset>(
			INJECTABLE_TYPES.WikiPageAuthorizationRuleset
		);
		return ruleset.canAdmin(securityContext, page);
	},
	content: async (page: WikiPage, _: any, {securityContext}: SessionContext): Promise<String> => {
		if(page.contentId){
			// const contentFile = await dataLoader.getDocument(page.contentId);
			const fileRepository = container.get<FileRepository>(INJECTABLE_TYPES.FileRepository);
			const contentFile = await fileRepository.findById(page.contentId);
			const buffer: string[] = []
			const contents = new Promise<String>((resolve, reject) => {
				contentFile.readStream.on('data', (chunk) => { buffer.push(chunk.toString())});
				contentFile.readStream.on('error', (err) => reject(err));
				contentFile.readStream.on('end', () => { resolve(buffer.join()) });
			});
			return await contents;
		}
	}
};

const permissionControlledInterfaceAttributes = {
	accessControlList: async (
		document: DomainEntity,
		_: any,
		{ securityContext }: SessionContext
	): Promise<PermissionAssignment[]> => {
		return securityContext.getEntityPermissions(document._id, document.type);
	},
	canWrite: async (document: DomainEntity, _: any, { securityContext }: SessionContext): Promise<boolean> => {
		return await document.authorizationRuleset.canWrite(securityContext, document);
	},
	canAdmin: async (document: DomainEntity, _: any, { securityContext }: SessionContext): Promise<boolean> => {
		return await document.authorizationRuleset.canAdmin(securityContext, document);
	},
};

const modeledWikiAttributes = {
	model: async (document: ModeledPage, _: any, __: SessionContext): Promise<Model> => {
		const dataLoader = container.get<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader);
		return dataLoader.getDocument(document.model);
	},
};

export const TypeResolvers = {
	World: {
		roles: async (world: World, _: any, { securityContext }: SessionContext): Promise<Role[]> => {
			const dataLoader = container.get<DataLoader<Role>>(INJECTABLE_TYPES.RoleDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, world.roles);
		},
		rootFolder: async (world: World, _: any, { securityContext }: SessionContext): Promise<WikiFolder> => {
			const dataLoader = container.get<DataLoader<WikiFolder>>(
				INJECTABLE_TYPES.WikiFolderDataLoader
			);
			return dataLoader.getPermissionControlledDocument(securityContext, world.rootFolder);
		},
		wikiPage: async (world: World, _: any, __: SessionContext): Promise<WikiPage> => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(world.wikiPage);
		},
		canAddRoles: async (world: World, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			const ruleset = container.get<RoleAuthorizationRuleset>(
				INJECTABLE_TYPES.RoleAuthorizationRuleset
			);
			return ruleset.canCreate(securityContext, world);
		},
		canHostGame: async (world: World, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			const ruleset = container.get<GameAuthorizationRuleset>(
				INJECTABLE_TYPES.GameAuthorizationRuleset
			);
			return ruleset.canCreate(securityContext, world);
		},
		canAddModels: async (world: World, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			const ruleset = container.get<ModelAuthorizationRuleset>(
				INJECTABLE_TYPES.ModelAuthorizationRuleset
			);
			return ruleset.canCreate(securityContext, world);
		},
		pins: async (world: World, _: any, { securityContext }: SessionContext): Promise<Pin[]> => {
			const dataLoader = container.get<DataLoader<Pin>>(INJECTABLE_TYPES.PinDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, world.pins);
		},
		...permissionControlledInterfaceAttributes,
	},
	PermissionControlled: {
		__resolveType: async (subject: DomainEntity): Promise<string> => {
			return subject.type;
		},
	},
	User: {
		email: async (user: User, _: any, { securityContext }: SessionContext): Promise<string> => {
			if (user._id !== securityContext.user._id) {
				return null;
			}
			return user.email;
		},
		roles: async (user: User, _: any, { securityContext }: SessionContext): Promise<Role[]> => {
			const dataLoader = container.get<DataLoader<Role>>(INJECTABLE_TYPES.RoleDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, user.roles);
		},
		permissions: async (user: User, _: any, { securityContext }: SessionContext): Promise<PermissionAssignment[]> => {
			const dataLoader = container.get<DataLoader<PermissionAssignment>>(
				INJECTABLE_TYPES.PermissionAssignmentDataLoader
			);
			return dataLoader.getPermissionControlledDocuments(securityContext, user.permissions);
		},
		currentWorld: async (user: User, _: any, { securityContext }: SessionContext): Promise<World> => {
			if (user._id !== securityContext.user._id) {
				return null;
			}
			if (user.currentWorld){
				const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
				return dataLoader.getPermissionControlledDocument(securityContext, user.currentWorld);
			}
		},
	},
	Role: {
		world: async (role: WikiFolder): Promise<World> => {
			if(role.world){
				const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
				return dataLoader.getDocument(role.world);
			}
		},
		permissions: async (role: Role, _: any, { securityContext }: SessionContext): Promise<PermissionAssignment[]> => {
			const ruleset = container.get<RoleAuthorizationRuleset>(
				INJECTABLE_TYPES.RoleAuthorizationRuleset
			);
			const dataLoader = container.get<DataLoader<PermissionAssignment>>(
				INJECTABLE_TYPES.PermissionAssignmentDataLoader
			);
			if (
				role.name === EVERYONE ||
				role.name === LOGGED_IN ||
				(await ruleset.canWrite(securityContext, role)) ||
				(await securityContext.hasRole(role.name))
			) {
				return dataLoader.getDocuments(role.permissions);
			} else {
				return dataLoader.getPermissionControlledDocuments(securityContext, role.permissions);
			}
		},
		members: async (role: Role, _: any, { securityContext }: SessionContext): Promise<User[]> => {
			const ruleset = container.get<RoleAuthorizationRuleset>(
				INJECTABLE_TYPES.RoleAuthorizationRuleset
			);
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
		__resolveType: async (page: WikiPage): Promise<string> => {
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
		mapImage: async (page: Place): Promise<Image> => {
			const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
			if(page.mapImage){
				return dataLoader.getDocument(page.mapImage);
			}
		},
	},
	ModeledWiki: {
		__resolveType: async (page: ModeledPage): Promise<string> => {
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
		world: async (folder: WikiFolder): Promise<World> => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getDocument(folder.world);
		},
		children: async (folder: WikiFolder, _: any, { securityContext }: SessionContext): Promise<WikiFolder[]> => {
			const dataLoader = container.get<DataLoader<WikiFolder>>(INJECTABLE_TYPES.WikiFolderDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, folder.children);
		},
		...permissionControlledInterfaceAttributes,
	},
	Image: {
		world: async (image: Image): Promise<World> => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getDocument(image.world);
		},
		chunks: async (image: Image): Promise<Chunk[]> => {
			const dataLoader = container.get<DataLoader<Chunk>>(INJECTABLE_TYPES.ChunkDataLoader);
			return dataLoader.getDocuments(image.chunks);
		},
		icon: async (image: Image): Promise<Image> => {
			const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
			return dataLoader.getDocument(image.icon);
		},
	},
	Pin: {
		map: async (pin: Pin): Promise<Place> => {
			const dataLoader = container.get<DataLoader<Place>>(INJECTABLE_TYPES.PlaceDataLoader);
			return dataLoader.getDocument(pin.map);
		},
		page: async (pin: Pin): Promise<WikiPage> => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(pin.page);
		},
		canWrite: async (pin: Pin, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			return pin.authorizationRuleset.canWrite(securityContext, pin);
		},
	},
	ServerConfig: {
		registerCodes: async (server: ServerConfig, _: any, { securityContext }: SessionContext): Promise<string[]> => {
			if (!(await server.authorizationRuleset.canWrite(securityContext, server))) {
				return [];
			}
			return server.registerCodes;
		},
		roles: async (server: ServerConfig, _: any, { securityContext }: SessionContext): Promise<Role[]> => {
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
		subject: async (assignment: PermissionAssignment, _: any, __: SessionContext): Promise<DomainEntity> => {
			const mapper = new RepositoryMapper();
			const repository = mapper.map<DomainEntity>(assignment.subjectType);
			return repository.findById(assignment.subject);
		},
		canWrite: async (
			assignment: PermissionAssignment,
			_: any,
			{ securityContext }: SessionContext
		): Promise<boolean> => {
			return await assignment.authorizationRuleset.canWrite(securityContext, assignment);
		},
		users: async (
			assignment: PermissionAssignment,
			_: any,
			{ securityContext }: SessionContext
		): Promise<User[]> => {
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
		): Promise<Role[]> => {
			if (!(await assignment.authorizationRuleset.canRead(securityContext, assignment))) {
				return [];
			}
			const repository = container.get<RoleRepository>(INJECTABLE_TYPES.RoleRepository);
			return repository.find([new FilterCondition("permissions", assignment._id)]);
		},
	},
	Game: {
		world: async (game: Game, _: any, { securityContext }: SessionContext): Promise<World> => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getPermissionControlledDocument(securityContext, game.world);
		},
		map: async (game: Game, _: any, { securityContext }: SessionContext): Promise<Place> => {
			const dataLoader = container.get<DataLoader<Place>>(INJECTABLE_TYPES.PlaceDataLoader);
			return dataLoader.getDocument(game.map);
		},
		characters: async (game: Game): Promise<any[]> => {
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
		messages: async (game: Game, _: any, { securityContext }: SessionContext): Promise<Message[]> => {
			return game.messages.filter(
				(message) =>
					message.receiver === securityContext.user.username || message.receiver === "all"
			);
		},
		canWriteFog: async (game: Game, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			return await game.authorizationRuleset.userCanWriteFog(securityContext, game);
		},
		canPaint: async (game: Game, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			return await game.authorizationRuleset.userCanPaint(securityContext, game);
		},
		canModel: async (game: Game, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			return await game.authorizationRuleset.userCanModel(securityContext, game);
		},
		...permissionControlledInterfaceAttributes,
	},
	PositionedModel: {
		model: async (model: InGameModel): Promise<Model> => {
			const dataLoader = container.get<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader);
			return dataLoader.getDocument(model.model);
		},
		wiki: async (model: InGameModel): Promise<WikiPage> => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(model.wiki);
		},
	},
	Model: {
		...permissionControlledInterfaceAttributes,
	},
	Upload: GraphQLUpload,
};
