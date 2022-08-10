import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants";
import { GraphQLUpload } from "graphql-upload";
import { container } from "../di/inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { World } from "../domain-entities/world";
import {
	DataLoader,
	DomainEntity, FileRepository, GameFactory, ModelFactory, PermissionAssignmentRepository, RoleFactory,
	RoleRepository,
	SessionContext,
	UserRepository,
	WikiFolderRepository,
} from "../types";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { FilterCondition } from "../dal/filter-condition";
import { WikiPage } from "../domain-entities/wiki-page";
import { Image } from "../domain-entities/image";
import { Model } from "../domain-entities/model";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Role } from "../domain-entities/role";
import { User } from "../domain-entities/user";
import { Pin } from "../domain-entities/pin";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { Place } from "../domain-entities/place";
import { Chunk } from "../domain-entities/chunk";
import { ServerConfig } from "../domain-entities/server-config";
import {Game, InGameModel, Message} from "../domain-entities/game";
import EntityMapper from "../domain-entities/entity-mapper";

const wikiPageInterfaceAttributes = {
	world: async (page: WikiPage, _: any, {unitOfWork}: SessionContext): Promise<World> => {
		const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
		return dataLoader.getDocument(page.world, unitOfWork);
	},
	folder: async (page: WikiPage): Promise<WikiFolder> => {
		const repository = container.get<WikiFolderRepository>(INJECTABLE_TYPES.WikiFolderRepository);
		return repository.findOne([new FilterCondition("pages", page._id)]);
	},
	coverImage: async (page: WikiPage, _: any, {unitOfWork}: SessionContext): Promise<Image> => {
		const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
		if(page.coverImage){
			return dataLoader.getDocument(page.coverImage, unitOfWork);
		}
	},
	canWrite: async (page: WikiPage, _: any, { securityContext, unitOfWork }: SessionContext): Promise<boolean> => {
		return page.authorizationPolicy.canWrite(securityContext, unitOfWork);
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
		{ securityContext, unitOfWork }: SessionContext
	): Promise<PermissionAssignment[]> => {
		let permissions: PermissionAssignment[] = [];
		const permissionAssignmentRepository: PermissionAssignmentRepository = container.get<PermissionAssignmentRepository>(INJECTABLE_TYPES.PermissionAssignmentRepository);
		if (await document.authorizationPolicy.canAdmin(securityContext, unitOfWork)) {
			permissions = await permissionAssignmentRepository.find([new FilterCondition('subjectType', document.type),
				new FilterCondition('subject', document._id)]);
		} else {
			permissions = securityContext.getEntityPermissions(document._id, document.type);
		}
		return permissions;
	},
	canWrite: async (document: DomainEntity, _: any, { securityContext, unitOfWork }: SessionContext): Promise<boolean> => {
		return await document.authorizationPolicy.canWrite(securityContext, unitOfWork);
	},
	canAdmin: async (document: DomainEntity, _: any, { securityContext, unitOfWork }: SessionContext): Promise<boolean> => {
		return await document.authorizationPolicy.canAdmin(securityContext, unitOfWork);
	},
};

const modeledWikiAttributes = {
	model: async (document: ModeledPage, _: any, {unitOfWork}: SessionContext): Promise<Model> => {
		const dataLoader = container.get<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader);
		if(document.pageModel){
			return dataLoader.getDocument(document.pageModel, unitOfWork);
		}
	},
};

export const TypeResolvers = {
	World: {
		rootFolder: async (world: World, _: any, { securityContext, unitOfWork }: SessionContext): Promise<WikiFolder> => {
			const dataLoader = container.get<DataLoader<WikiFolder>>(
				INJECTABLE_TYPES.WikiFolderDataLoader
			);
			return dataLoader.getPermissionControlledDocument(securityContext, world.rootFolder, unitOfWork);
		},
		wikiPage: async (world: World, _: any, {unitOfWork}: SessionContext): Promise<WikiPage> => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(world.wikiPage, unitOfWork);
		},
		canAddRoles: async (world: World, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			const roleFactory = container.get<RoleFactory>(INJECTABLE_TYPES.RoleFactory);
			const testRole = roleFactory({_id: null, name: "test role", world: world._id, permissions: []});
			return testRole.authorizationPolicy.canCreate(securityContext);
		},
		canHostGame: async (world: World, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			const gameFactory = container.get<GameFactory>(INJECTABLE_TYPES.GameFactory);
			const testGame = gameFactory({_id: null, passwordHash: "password", world: world._id, map: null, characters: [], strokes: [], fog: [], messages: [], models: [], host: null});
			return testGame.authorizationPolicy.canCreate(securityContext);
		},
		canAddModels: async (world: World, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			const modelFactory = container.get<ModelFactory>(INJECTABLE_TYPES.ModelFactory);
			const testModel = modelFactory({_id: null, world: world._id, name: "model", depth: 0, width: 0, height: 0, fileName: null, fileId: null, notes: ""});
			return testModel.authorizationPolicy.canCreate(securityContext);
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
		roles: async (user: User, _: any, { securityContext, unitOfWork }: SessionContext): Promise<Role[]> => {
			const dataLoader = container.get<DataLoader<Role>>(INJECTABLE_TYPES.RoleDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, user.roles, unitOfWork);
		},
		permissions: async (user: User, _: any, { securityContext, unitOfWork }: SessionContext): Promise<PermissionAssignment[]> => {
			const dataLoader = container.get<DataLoader<PermissionAssignment>>(
				INJECTABLE_TYPES.PermissionAssignmentDataLoader
			);
			return dataLoader.getPermissionControlledDocuments(securityContext, user.permissions, unitOfWork);
		},
		currentWorld: async (user: User, _: any, { securityContext, unitOfWork }: SessionContext): Promise<World> => {
			if (user._id !== securityContext.user._id) {
				return null;
			}
			if (user.currentWorld){
				const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
				return dataLoader.getPermissionControlledDocument(securityContext, user.currentWorld, unitOfWork);
			}
		},
	},
	Role: {
		world: async (role: WikiFolder, _: any, {unitOfWork}: SessionContext): Promise<World> => {
			if(role.world){
				const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
				return dataLoader.getDocument(role.world, unitOfWork);
			}
		},
		permissions: async (role: Role, _: any, { securityContext, unitOfWork }: SessionContext): Promise<PermissionAssignment[]> => {
			const dataLoader = container.get<DataLoader<PermissionAssignment>>(
				INJECTABLE_TYPES.PermissionAssignmentDataLoader
			);
			if (
				role.name === EVERYONE ||
				role.name === LOGGED_IN ||
				(await role.authorizationPolicy.canWrite(securityContext)) ||
				(await securityContext.hasRole(role.name))
			) {
				return dataLoader.getDocuments(role.permissions, unitOfWork);
			} else {
				return dataLoader.getPermissionControlledDocuments(securityContext, role.permissions, unitOfWork);
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
		mapImage: async (page: Place, _: any, {unitOfWork}: SessionContext): Promise<Image> => {
			const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
			if(page.mapImage){
				return dataLoader.getDocument(page.mapImage, unitOfWork);
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
		world: async (folder: WikiFolder, _: any, {unitOfWork}: SessionContext): Promise<World> => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getDocument(folder.world, unitOfWork);
		},
		children: async (folder: WikiFolder, _: any, { securityContext, unitOfWork }: SessionContext): Promise<WikiFolder[]> => {
			const dataLoader = container.get<DataLoader<WikiFolder>>(INJECTABLE_TYPES.WikiFolderDataLoader);
			return dataLoader.getPermissionControlledDocuments(securityContext, folder.children, unitOfWork);
		},
		...permissionControlledInterfaceAttributes,
	},
	Image: {
		world: async (image: Image, _: any, {unitOfWork}: SessionContext): Promise<World> => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getDocument(image.world, unitOfWork);
		},
		chunks: async (image: Image, _: any, {unitOfWork}: SessionContext): Promise<Chunk[]> => {
			const dataLoader = container.get<DataLoader<Chunk>>(INJECTABLE_TYPES.ChunkDataLoader);
			return dataLoader.getDocuments(image.chunks, unitOfWork);
		},
		icon: async (image: Image, _: any, {unitOfWork}: SessionContext): Promise<Image> => {
			const dataLoader = container.get<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader);
			return dataLoader.getDocument(image.icon, unitOfWork);
		},
	},
	Pin: {
		map: async (pin: Pin, _: any, {unitOfWork}: SessionContext): Promise<Place> => {
			const dataLoader = container.get<DataLoader<Place>>(INJECTABLE_TYPES.PlaceDataLoader);
			return dataLoader.getDocument(pin.map, unitOfWork);
		},
		page: async (pin: Pin, _: any, {unitOfWork}: SessionContext): Promise<WikiPage> => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(pin.page, unitOfWork);
		},
		canWrite: async (pin: Pin, _: any, { securityContext, unitOfWork }: SessionContext): Promise<boolean> => {
			return pin.authorizationPolicy.canWrite(securityContext, unitOfWork);
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
		subject: async (assignment: PermissionAssignment, _: any, {unitOfWork}: SessionContext): Promise<DomainEntity> => {
			const mapper = container.get<EntityMapper>(INJECTABLE_TYPES.EntityMapper);
			const repository = mapper.map(assignment.subjectType).getRepository(unitOfWork);
			return repository.findById(assignment.subject);
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
		world: async (game: Game, _: any, { securityContext, unitOfWork }: SessionContext): Promise<World> => {
			const dataLoader = container.get<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader);
			return dataLoader.getPermissionControlledDocument(securityContext, game.world, unitOfWork);
		},
		map: async (game: Game, _: any, { unitOfWork }: SessionContext): Promise<Place> => {
			const dataLoader = container.get<DataLoader<Place>>(INJECTABLE_TYPES.PlaceDataLoader);
			return dataLoader.getDocument(game.map, unitOfWork);
		},
		characters: async (game: Game, _: any, {unitOfWork}: SessionContext): Promise<any[]> => {
			const dataLoader = container.get<DataLoader<User>>(INJECTABLE_TYPES.UserRepository);
			const characters = [];
			for (let character of game.characters) {
				characters.push({
					name: character.name,
					color: character.color,
					player: await dataLoader.getDocument(character.player, unitOfWork),
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
		model: async (model: InGameModel, _: any, {unitOfWork}: SessionContext): Promise<Model> => {
			const dataLoader = container.get<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader);
			return dataLoader.getDocument(model.model, unitOfWork);
		},
		wiki: async (model: InGameModel, _: any, {unitOfWork}: SessionContext): Promise<WikiPage> => {
			const dataLoader = container.get<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader);
			return dataLoader.getDocument(model.wiki, unitOfWork);
		},
	},
	Model: {
		...permissionControlledInterfaceAttributes,
	},
	Upload: GraphQLUpload,
};
