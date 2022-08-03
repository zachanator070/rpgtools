import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants";
import { GraphQLUpload } from "graphql-upload";
import { container } from "../di/inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { World } from "../domain-entities/world";
import {
	DataLoader,
	DomainEntity, Factory, FileRepository, GameFactory, ModelFactory, PermissionAssignmentRepository, RoleFactory,
	RoleRepository,
	SessionContext,
	UserRepository,
	WikiFolderRepository,
} from "../types";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { FilterCondition } from "../dal/filter-condition";
import { WikiPage } from "../domain-entities/wiki-page";
import { Image } from "../domain-entities/image";
import { WikiPageAuthorizationPolicy } from "../security/policy/wiki-page-authorization-policy";
import { Model } from "../domain-entities/model";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Role } from "../domain-entities/role";
import { RoleAuthorizationPolicy } from "../security/policy/role-authorization-policy";
import { GameAuthorizationPolicy } from "../security/policy/game-authorization-policy";
import { ModelAuthorizationPolicy } from "../security/policy/model-authorization-policy";
import { User } from "../domain-entities/user";
import { Pin } from "../domain-entities/pin";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { Place } from "../domain-entities/place";
import { Chunk } from "../domain-entities/chunk";
import { ServerConfig } from "../domain-entities/server-config";
import { RepositoryMapper } from "../dal/repository-mapper";
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
		return page.authorizationPolicy.canWrite(securityContext);
	},
	canAdmin: async (page: WikiPage, _: any, { securityContext }: SessionContext): Promise<boolean> => {
		return page.authorizationPolicy.canAdmin(securityContext);
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
		let permissions: PermissionAssignment[] = [];
		const permissionAssignmentRepository: PermissionAssignmentRepository = container.get<PermissionAssignmentRepository>(INJECTABLE_TYPES.PermissionAssignmentRepository);
		if (await document.authorizationPolicy.canAdmin(securityContext)) {
			permissions = await permissionAssignmentRepository.find([new FilterCondition('subjectType', document.type),
				new FilterCondition('subject', document._id)]);
		} else {
			permissions = securityContext.getEntityPermissions(document._id, document.type);
		}
		return permissions;
	},
	canWrite: async (document: DomainEntity, _: any, { securityContext }: SessionContext): Promise<boolean> => {
		return await document.authorizationPolicy.canWrite(securityContext);
	},
	canAdmin: async (document: DomainEntity, _: any, { securityContext }: SessionContext): Promise<boolean> => {
		return await document.authorizationPolicy.canAdmin(securityContext);
	},
};

const modeledWikiAttributes = {
	model: async (document: ModeledPage, _: any, __: SessionContext): Promise<Model> => {
		const dataLoader = container.get<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader);
		if(document.pageModel){
			return dataLoader.getDocument(document.pageModel);
		}
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
			const roleFactory = container.get<RoleFactory>(INJECTABLE_TYPES.RoleFactory);
			const testRole = roleFactory(null, "test role", world._id, []);
			return testRole.authorizationPolicy.canCreate(securityContext);
		},
		canHostGame: async (world: World, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			const gameFactory = container.get<GameFactory>(INJECTABLE_TYPES.GameFactory);
			const testGame = gameFactory(null, "password", world._id, null, [], [], [], [], [], null);
			return testGame.authorizationPolicy.canCreate(securityContext);
		},
		canAddModels: async (world: World, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			const modelFactory = container.get<ModelFactory>(INJECTABLE_TYPES.ModelFactory);
			const testModel = modelFactory(null, world._id, "model", 0, 0, 0, null, null, "");
			return testModel.authorizationPolicy.canCreate(securityContext);
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
			const dataLoader = container.get<DataLoader<PermissionAssignment>>(
				INJECTABLE_TYPES.PermissionAssignmentDataLoader
			);
			if (
				role.name === EVERYONE ||
				role.name === LOGGED_IN ||
				(await role.authorizationPolicy.canWrite(securityContext)) ||
				(await securityContext.hasRole(role.name))
			) {
				return dataLoader.getDocuments(role.permissions);
			} else {
				return dataLoader.getPermissionControlledDocuments(securityContext, role.permissions);
			}
		},
		members: async (role: Role, _: any, { securityContext }: SessionContext): Promise<User[]> => {
			if (
				!(await role.authorizationPolicy.canWrite(securityContext)) &&
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
			return pin.authorizationPolicy.canWrite(securityContext);
		},
	},
	ServerConfig: {
		registerCodes: async (server: ServerConfig, _: any, { securityContext }: SessionContext): Promise<string[]> => {
			if (!(await server.authorizationPolicy.canWrite(securityContext))) {
				return [];
			}
			return server.registerCodes;
		},
		roles: async (server: ServerConfig, _: any, { securityContext }: SessionContext): Promise<Role[]> => {
			const repository = container.get<RoleRepository>(INJECTABLE_TYPES.RoleRepository);
			const roles = await repository.find([]);
			const returnRoles = [];
			for (let role of roles) {
				if (await role.authorizationPolicy.canAdmin(securityContext)) {
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
			const subject = await repository.findById(assignment.subject);
			return subject;
		},
		canWrite: async (
			assignment: PermissionAssignment,
			_: any,
			{ securityContext }: SessionContext
		): Promise<boolean> => {
			return await assignment.authorizationPolicy.canWrite(securityContext);
		},
		users: async (
			assignment: PermissionAssignment,
			_: any,
			{ securityContext }: SessionContext
		): Promise<User[]> => {
			if (!(await assignment.authorizationPolicy.canRead(securityContext))) {
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
			if (!(await assignment.authorizationPolicy.canRead(securityContext))) {
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
			return await game.authorizationPolicy.userCanWriteFog(securityContext);
		},
		canPaint: async (game: Game, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			return await game.authorizationPolicy.userCanPaint(securityContext);
		},
		canModel: async (game: Game, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			return await game.authorizationPolicy.userCanModel(securityContext);
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
