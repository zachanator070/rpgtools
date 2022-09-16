import { GraphQLUpload } from "graphql-upload";
import { container } from "../di/inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { World } from "../domain-entities/world";
import {
	AclEntry,
	DataLoader,
	DomainEntity, FileRepository, GameFactory, ModelFactory, PermissionControlledEntity, RoleFactory,
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
import { Place } from "../domain-entities/place";
import { Chunk } from "../domain-entities/chunk";
import { ServerConfig } from "../domain-entities/server-config";
import {Game, InGameModel, Message} from "../domain-entities/game";
import EntityMapper from "../domain-entities/entity-mapper";
import {MESSAGE_ALL_RECEIVE} from "../services/game-service";
import {ServerConfigService} from "../services/server-config-service";

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
	canAdmin: async (page: WikiPage, _: any, { securityContext, unitOfWork }: SessionContext): Promise<boolean> => {
		return page.authorizationPolicy.canAdmin(securityContext, unitOfWork);
	},
	content: async (page: WikiPage, _: any, __: SessionContext): Promise<String> => {
		if(page.contentId){
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
		__: SessionContext
	): Promise<AclEntry[]> => {
		return (document as PermissionControlledEntity).acl;
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
		canAddRoles: async (world: World, _: any, { securityContext, unitOfWork }: SessionContext): Promise<boolean> => {
			const roleFactory = container.get<RoleFactory>(INJECTABLE_TYPES.RoleFactory);
			const testRole = roleFactory({_id: null, name: "test role", world: world._id, acl: []});
			return testRole.authorizationPolicy.canCreate(securityContext, unitOfWork);
		},
		canHostGame: async (world: World, _: any, { securityContext, unitOfWork }: SessionContext): Promise<boolean> => {
			const gameFactory = container.get<GameFactory>(INJECTABLE_TYPES.GameFactory);
			const testGame = gameFactory({_id: null, passwordHash: "password", world: world._id, map: null, characters: [], strokes: [], fog: [], messages: [], models: [], host: null, acl: []});
			return testGame.authorizationPolicy.canCreate(securityContext, unitOfWork);
		},
		canAddModels: async (world: World, _: any, { securityContext, unitOfWork }: SessionContext): Promise<boolean> => {
			const modelFactory = container.get<ModelFactory>(INJECTABLE_TYPES.ModelFactory);
			const testModel = modelFactory({_id: null, world: world._id, name: "model", depth: 0, width: 0, height: 0, fileName: null, fileId: null, notes: "", acl: []});
			return testModel.authorizationPolicy.canCreate(securityContext, unitOfWork);
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
		members: async (role: Role, _: any, { securityContext, unitOfWork }: SessionContext): Promise<User[]> => {
			if (
				!(await role.authorizationPolicy.canWrite(securityContext, unitOfWork)) &&
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
		roles: async (server: ServerConfig, _: any, { securityContext, unitOfWork }: SessionContext): Promise<Role[]> => {
			const repository = container.get<RoleRepository>(INJECTABLE_TYPES.RoleRepository);
			const roles = await repository.find([]);
			const returnRoles = [];
			for (let role of roles) {
				if (await role.authorizationPolicy.canAdmin(securityContext, unitOfWork)) {
					returnRoles.push(role);
				}
			}
			return returnRoles;
		},
		canCreateWorlds: async (server: ServerConfig, _: any, { securityContext }: SessionContext): Promise<boolean> => {
			return server.authorizationPolicy.canCreateWorlds(securityContext);
		},
		serverNeedsSetup: async (server: ServerConfig, _: any, { unitOfWork }: SessionContext): Promise<boolean> => {
			const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
			return service.serverNeedsSetup(unitOfWork);
		},
		...permissionControlledInterfaceAttributes,
	},
	AclEntry: {
		principal: async (entry: AclEntry, _: any, { unitOfWork }: SessionContext): Promise<DomainEntity> => {
			const entityMapper = container.get<EntityMapper>(INJECTABLE_TYPES.EntityMapper);
			const repo = entityMapper.map(entry.principalType).getRepository(unitOfWork);
			return repo.findById(entry.principal);
		}
	},
	AclPrincipal: {
		__resolveType: async (subject: DomainEntity): Promise<string> => {
			return subject.type;
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
			const dataLoader = container.get<DataLoader<User>>(INJECTABLE_TYPES.UserDataLoader);
			const characters = [];
			for (let character of game.characters) {
				characters.push({
					_id: character._id,
					name: character.name,
					color: character.color,
					player: await dataLoader.getDocument(character.player, unitOfWork),
					attributes: character.attributes
				});
			}
			return characters;
		},
		host: async (game: Game, _: any, {unitOfWork}: SessionContext): Promise<any> => {
			const dataLoader = container.get<DataLoader<User>>(INJECTABLE_TYPES.UserDataLoader);
			if (game.host) {
				return dataLoader.getDocument(game.host, unitOfWork);
			}
		},
		messages: async (game: Game, _: any, { securityContext }: SessionContext): Promise<Message[]> => {
			return game.messages.filter(
				(message) =>
					message.receiverUser === securityContext.user._id || message.receiver === MESSAGE_ALL_RECEIVE
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
