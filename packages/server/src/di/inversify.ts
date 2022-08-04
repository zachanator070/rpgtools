import "reflect-metadata";
import { Container } from "inversify";
import {
	ArticleRepository,
	ChunkRepository,
	EventPublisher,
	FileRepository,
	GameRepository,
	ImageRepository,
	ItemRepository,
	ModelRepository,
	MonsterRepository,
	PermissionAssignmentRepository,
	PersonRepository,
	PinRepository,
	PlaceRepository,
	RoleRepository,
	ServerConfigRepository,
	SessionContextFactory,
	UserRepository,
	WikiFolderRepository,
	WikiPageRepository,
	WorldRepository,
	Cache,
	AbstractArchiveFactory,
	ApiServer,
	DataLoader,
	Factory,
	DomainEntity,
	WorldFactory,
	WikiFolderFactory,
	UserFactory,
	ServerConfigFactory,
	RoleFactory,
	PlaceFactory,
	PinFactory,
	PersonFactory,
	PermissionAssignmentFactory,
	MonsterFactory,
	ModelFactory,
	ItemFactory,
	ImageFactory,
	GameFactory, FileFactory, ChunkFactory, ArticleFactory
} from "../types";
import { INJECTABLE_TYPES } from "./injectable-types";
import { MongodbArticleRepository } from "../dal/mongodb/repositories/mongodb-article-repository";
import { ApolloExpressEventPublisher } from "../server/apollo-express-event-publisher";
import { MongodbChunkRepository } from "../dal/mongodb/repositories/mongodb-chunk-repository";
import { MongodbGameRepository } from "../dal/mongodb/repositories/mongodb-game-repository";
import { MongodbItemRepository } from "../dal/mongodb/repositories/mongodb-item-repository";
import { MongodbFileRepository } from "../dal/mongodb/repositories/mongodb-file-repository";
import { MongodbWorldRepository } from "../dal/mongodb/repositories/mongodb-world-repository";
import { MongodbWikiPageRepository } from "../dal/mongodb/repositories/mongodb-wiki-page-repository";
import { MongodbWikiFolderRepository } from "../dal/mongodb/repositories/mongodb-wiki-folder-repository";
import { MongodbUserRepository } from "../dal/mongodb/repositories/mongodb-user-repository";
import { MongodbServerConfigRepository } from "../dal/mongodb/repositories/mongodb-server-config-repository";
import { MongodbRoleRepository } from "../dal/mongodb/repositories/mongodb-role-repository";
import { MongodbPlaceRepository } from "../dal/mongodb/repositories/mongodb-place-repository";
import { MongodbPinRepository } from "../dal/mongodb/repositories/mongodb-pin-repository";
import { MongodbPersonRepository } from "../dal/mongodb/repositories/mongodb-person-repository";
import { MongodbPermissionAssignmentRepository } from "../dal/mongodb/repositories/mongodb-permission-assignment-repository";
import { MongodbMonsterRepository } from "../dal/mongodb/repositories/mongodb-monster-repository";
import { MongodbModelRepository } from "../dal/mongodb/repositories/mongodb-model-repository";
import { MongodbImageRepository } from "../dal/mongodb/repositories/mongodb-image-repository";
import { InMemoryArticleRepository } from "../dal/in-memory/repositories/in-memory-article-repository";
import { InMemoryChunkRepository } from "../dal/in-memory/repositories/in-memory-chunk-repository";
import { InMemoryGameRepository } from "../dal/in-memory/repositories/in-memory-game-repository";
import { InMemoryImageRepository } from "../dal/in-memory/repositories/in-memory-image-repository";
import { InMemoryItemRepository } from "../dal/in-memory/repositories/in-memory-item-repository";
import { InMemoryModelRepository } from "../dal/in-memory/repositories/in-memory-model-repository";
import { InMemoryMonsterRepository } from "../dal/in-memory/repositories/in-memory-monster-repository";
import { InMemoryPermissionAssignmentRepository } from "../dal/in-memory/repositories/in-memory-permission-assignment-repository";
import { InMemoryPersonRepository } from "../dal/in-memory/repositories/in-memory-person-repository";
import { InMemoryPinRepository } from "../dal/in-memory/repositories/in-memory-pin-repository";
import { InMemoryPlaceRepository } from "../dal/in-memory/repositories/in-memory-place-repository";
import { InMemoryRoleRepository } from "../dal/in-memory/repositories/in-memory-role-repository";
import { InMemoryServerConfigRepository } from "../dal/in-memory/repositories/in-memory-server-config-repository";
import { InMemoryUserRepository } from "../dal/in-memory/repositories/in-memory-user-repository";
import { InMemoryWikiFolderRepository } from "../dal/in-memory/repositories/in-memory-wiki-folder-repository";
import { InMemoryWikiPageRepository } from "../dal/in-memory/repositories/in-memory-wiki-page-repository";
import { InMemoryWorldRepository } from "../dal/in-memory/repositories/in-memory-world-repository";
import { InMemoryFileRepository } from "../dal/in-memory/repositories/in-memory-file-repository";
import { AuthenticationService } from "../services/authentication-service";
import { AuthorizationService } from "../services/authorization-service";
import { ContentExportService } from "../services/content-export-service";
import { ContentImportService } from "../services/content-import-service";
import { GameService } from "../services/game-service";
import { ImageService } from "../services/image-service";
import { ModelService } from "../services/model-service";
import { ServerConfigService } from "../services/server-config-service";
import { SrdImportService } from "../services/srd-import-service";
import { UserService } from "../services/user-service";
import { WikiFolderService } from "../services/wiki-folder-service";
import { WikiPageService } from "../services/wiki-page-service";
import { WorldService } from "../services/world-service";
import { ExpressSessionContextFactory } from "../server/express-session-context-factory";
import { Open5eApiClient } from "../five-e-import/open-5e-api-client";
import { RedisClient } from "../dal/cache/redis-client";
import { ArchiveFactory } from "../archive/archive-factory";
import { ExpressApiServer } from "../server/express-api-server";
import { Article } from "../domain-entities/article";
import { ArticleDataLoader } from "../dal/dataloaders/article-data-loader";
import { Chunk } from "../domain-entities/chunk";
import { File } from "../domain-entities/file";
import { Character, FogStroke, Game, InGameModel, Message, Stroke } from "../domain-entities/game";
import { Image } from "../domain-entities/image";
import { Item } from "../domain-entities/item";
import { Model } from "../domain-entities/model";
import { Monster } from "../domain-entities/monster";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { PermissionAssignmentDataLoader } from "../dal/dataloaders/permission-assignment-data-loader";
import { Person } from "../domain-entities/person";
import { Pin } from "../domain-entities/pin";
import { Place } from "../domain-entities/place";
import { Role } from "../domain-entities/role";
import { ServerConfig } from "../domain-entities/server-config";
import { ServerConfigDataLoader } from "../dal/dataloaders/server-config-data-loader";
import { User } from "../domain-entities/user";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { WikiFolderDataLoader } from "../dal/dataloaders/wiki-folder-data-loader";
import { WikiPage } from "../domain-entities/wiki-page";
import { World } from "../domain-entities/world";
import { ChunkDataLoader } from "../dal/dataloaders/chunk-data-loader";
import { FileDataLoader } from "../dal/dataloaders/file-data-loader";
import { GameDataLoader } from "../dal/dataloaders/game-data-loader";
import { ImageDataLoader } from "../dal/dataloaders/image-data-loader";
import { ItemDataLoader } from "../dal/dataloaders/item-data-loader";
import { ModelDataLoader } from "../dal/dataloaders/model-data-loader";
import { MonsterDataLoader } from "../dal/dataloaders/monster-data-loader";
import { PersonDataLoader } from "../dal/dataloaders/person-data-loader";
import { PinDataLoader } from "../dal/dataloaders/pin-data-loader";
import { PlaceDataLoader } from "../dal/dataloaders/place-data-loader";
import { RoleDataLoader } from "../dal/dataloaders/role-data-loader";
import { WikiPageDataLoader } from "../dal/dataloaders/wiki-page-data-loader";
import { WorldDataLoader } from "../dal/dataloaders/world-data-loader";
import { UserDataLoader } from "../dal/dataloaders/user-data-loader";
import { RoleSeeder } from "../seeders/role-seeder";
import { ServerConfigSeeder } from "../seeders/server-config-seeder";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { SecurityContextFactory } from "../security/security-context-factory";
import { ArticleAuthorizationPolicy } from "../security/policy/article-authorization-policy";
import { ChunkAuthorizationPolicy } from "../security/policy/chunk-authorization-policy";
import { FileAuthorizationPolicy } from "../security/policy/file-authorization-policy";
import { GameAuthorizationPolicy } from "../security/policy/game-authorization-policy";
import { ImageAuthorizationPolicy } from "../security/policy/image-authorization-policy";
import { ItemAuthorizationPolicy } from "../security/policy/item-authorization-policy";
import { ModelAuthorizationPolicy } from "../security/policy/model-authorization-policy";
import { MonsterAuthorizationPolicy } from "../security/policy/monster-authorization-policy";
import { PermissionAssignmentAuthorizationPolicy } from "../security/policy/permission-assignment-authorization-policy";
import { PersonAuthorizationPolicy } from "../security/policy/person-authorization-policy";
import { PinAuthorizationPolicy } from "../security/policy/pin-authorization-policy";
import { PlaceAuthorizationPolicy } from "../security/policy/place-authorization-policy";
import { RoleAuthorizationPolicy } from "../security/policy/role-authorization-policy";
import { ServerConfigAuthorizationPolicy } from "../security/policy/server-config-authorization-policy";
import { UserAuthorizationPolicy } from "../security/policy/user-authorization-policy";
import { WikiFolderAuthorizationPolicy } from "../security/policy/wiki-folder-authorization-policy";
import { WikiPageAuthorizationPolicy } from "../security/policy/wiki-page-authorization-policy";
import { WorldAuthorizationPolicy } from "../security/policy/world-authorization-policy";
import { Readable } from "stream";
import { RepositoryMapper } from "../dal/repository-mapper";
import {ServerProperties} from "../server/server-properties";
import FilterFactory from "../dal/mongodb/FilterFactory";
import {NoCacheClient} from "../dal/cache/no-cache-client";
import {DeltaFactory} from "../five-e-import/delta-factory";
import {Dnd5eApiClient} from "../five-e-import/dnd-5e-api-client";
import {RoleService} from "../services/role-service";
import {ZipArchive} from "../archive/zip-archive";

const container = new Container();

// domain entities
container.bind<Article>(INJECTABLE_TYPES.Article).to(Article);
container.bind<Chunk>(INJECTABLE_TYPES.Chunk).to(Chunk);
container.bind<File>(INJECTABLE_TYPES.File).to(File);
container.bind<Game>(INJECTABLE_TYPES.Game).to(Game);
container.bind<Image>(INJECTABLE_TYPES.Image).to(Image);
container.bind<Item>(INJECTABLE_TYPES.Item).to(Item);
container.bind<Model>(INJECTABLE_TYPES.Model).to(Model);
container.bind<Monster>(INJECTABLE_TYPES.Monster).to(Monster);
container
	.bind<PermissionAssignment>(INJECTABLE_TYPES.PermissionAssignment)
	.to(PermissionAssignment);
container.bind<Person>(INJECTABLE_TYPES.Person).to(Person);
container.bind<Pin>(INJECTABLE_TYPES.Pin).to(Pin);
container.bind<Place>(INJECTABLE_TYPES.Place).to(Place);
container.bind<Role>(INJECTABLE_TYPES.Role).to(Role);
container.bind<ServerConfig>(INJECTABLE_TYPES.ServerConfig).to(ServerConfig);
container.bind<User>(INJECTABLE_TYPES.User).to(User);
container.bind<WikiFolder>(INJECTABLE_TYPES.WikiFolder).to(WikiFolder);
container.bind<World>(INJECTABLE_TYPES.World).to(World);

container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Article);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Chunk);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(File);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Game);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Image);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Item);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Model);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Monster);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(PermissionAssignment);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Pin);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Role);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(ServerConfig);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(User);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(WikiFolder);
container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(World);

// entity factories
container
	.bind<ArticleFactory>(INJECTABLE_TYPES.ArticleFactory)
	.toFactory(
		(context): ArticleFactory =>
			({
				 _id,
				 name,
				 world,
				 coverImage,
				 contentId
			 }:{
				_id: string,
				name: string,
				world: string,
				coverImage: string,
				contentId: string
			}) => {
				const article = context.container.get<Article>(INJECTABLE_TYPES.Article);
				article._id = _id
				article.name = name;
				article.world = world;
				article.coverImage = coverImage;
				article.contentId = contentId;
				return article;
			}
	);
container
	.bind<ChunkFactory>(INJECTABLE_TYPES.ChunkFactory)
	.toFactory(
		(context): ChunkFactory =>
			(
				{
					_id,
					x,
					y,
					width,
					height,
					fileId,
					image
				}:{
					_id: string,
					x: number,
					y: number,
					width: number,
					height: number,
					fileId: string,
					image: string
				}
			) => {
				const chunk = context.container.get<Chunk>(INJECTABLE_TYPES.Chunk);
				chunk._id = _id;
				chunk.x = x;
				chunk.y = y;
				chunk.width = width;
				chunk.height = height;
				chunk.fileId = fileId;
				chunk.image = image;
				return chunk;
			}
	);
container
	.bind<FileFactory>(INJECTABLE_TYPES.FileFactory)
	.toFactory((context): FileFactory =>
		(
			{
				 _id,
				 filename,
				 readStream,
				 mimeType
			}:{
				_id: string,
				filename: string,
				readStream: Readable,
				mimeType: string
			}
		) => {
		const file = context.container.get<File>(INJECTABLE_TYPES.File);
		file._id = _id;
		file.filename = filename;
		file.readStream = readStream;
		file.mimeType = mimeType;
		return file;
	});
container
	.bind<GameFactory>(INJECTABLE_TYPES.GameFactory)
	.toFactory(
		(context): GameFactory =>
			(
				{
					_id,
					passwordHash,
					world,
					map,
					characters,
					strokes,
					fog,
					messages,
					models,
					host
				}:{
					_id: string,
					passwordHash: string,
					world: string,
					map: string,
					characters: Character[],
					strokes: Stroke[],
					fog: FogStroke[],
					messages: Message[],
					models: InGameModel[],
					host: string
				}
			) => {
				const game = context.container.get<Game>(INJECTABLE_TYPES.Game);
				game._id = _id;
				game.passwordHash = passwordHash;
				game.world = world;
				game.map = map;
				game.characters = characters;
				game.strokes = strokes;
				game.fog = fog;
				game.messages = messages;
				game.models = models;
				game.host = host;
				return game;
			}
	);
container
	.bind<ImageFactory>(INJECTABLE_TYPES.ImageFactory)
	.toFactory(
		(context): ImageFactory =>
			(
				{
					_id,
					name,
					world,
					width,
					height,
					chunkWidth,
					chunkHeight,
					chunks,
					icon
				}:{
					_id: string,
					name: string,
					world: string,
					width: number,
					height: number,
					chunkWidth: number,
					chunkHeight: number,
					chunks: string[],
					icon: string
				}
			) => {
				const image = context.container.get<Image>(INJECTABLE_TYPES.Image);
				image._id = _id;
				image.name = name;
				image.world = world;
				image.width = width;
				image.height = height;
				image.chunkWidth = chunkWidth;
				image.chunkHeight = chunkHeight;
				image.chunks = chunks;
				image.icon = icon;
				return image;
			}
	);
container
	.bind<ItemFactory>(INJECTABLE_TYPES.ItemFactory)
	.toFactory(
		(context): ItemFactory =>
			(
				{
					_id,
					name,
					world,
					coverImage,
					content,
					pageModel,
					modelColor
				}:{
					_id: string,
					name: string,
					world: string,
					coverImage: string,
					content: string,
					pageModel: string,
					modelColor: string
				}
			) => {
				const item = context.container.get<Item>(INJECTABLE_TYPES.Item);
				item._id = _id;
				item.name = name;
				item.world = world;
				item.coverImage = coverImage;
				item.contentId = content;
				item.pageModel = pageModel;
				item.modelColor = modelColor;
				return item;
			}
	);

container
	.bind<ModelFactory>(INJECTABLE_TYPES.ModelFactory)
	.toFactory(
		(context): ModelFactory =>
			(
				{
					_id,
					world,
					name,
					depth,
					width,
					height,
					fileName,
					fileId,
					notes
				}:{
					_id: string,
					world: string,
					name: string,
					depth: number,
					width: number,
					height: number,
					fileName: string,
					fileId: string,
					notes: string
				}
			) => {
				const model = context.container.get<Model>(INJECTABLE_TYPES.Model);
				model._id = _id;
				model.world = world;
				model.name = name;
				model.depth = depth;
				model.width = width;
				model.height = height;
				model.fileName = fileName;
				model.fileId = fileId;
				model.notes = notes;
				return model;
			}
	);
container
	.bind<MonsterFactory>(INJECTABLE_TYPES.MonsterFactory)
	.toFactory(
		(context): MonsterFactory =>
			(
				{
					_id,
					name,
					world,
					coverImage,
					contentId,
					pageModel,
					modelColor
				}:{
					_id: string,
					name: string,
					world: string,
					coverImage: string,
					contentId: string,
					pageModel: string,
					modelColor: string
				}
			) => {
				const monster = context.container.get<Monster>(INJECTABLE_TYPES.Monster);
				monster._id = _id;
				monster.name = name;
				monster.world = world;
				monster.coverImage = coverImage;
				monster.contentId = contentId;
				monster.pageModel = pageModel;
				monster.modelColor = modelColor;
				return monster;
			}
	);
container
	.bind<PermissionAssignmentFactory>(INJECTABLE_TYPES.PermissionAssignmentFactory)
	.toFactory(
		(context): PermissionAssignmentFactory =>
			(
				{
					_id,
					permission,
					subject,
					subjectType
				}:{
					_id: string,
					permission: string,
					subject: string,
					subjectType: string
				}
			) => {
				const permissionAssignment = context.container.get<PermissionAssignment>(
					INJECTABLE_TYPES.PermissionAssignment
				);
				permissionAssignment._id = _id;
				permissionAssignment.permission = permission;
				permissionAssignment.subject = subject;
				permissionAssignment.subjectType = subjectType;
				return permissionAssignment;
			}
	);
container
	.bind<PersonFactory>(INJECTABLE_TYPES.PersonFactory)
	.toFactory(
		(context): PersonFactory =>
			(
				{
					_id,
					name,
					world,
					coverImage,
					contentId,
					pageModel,
					modelColor
				}:{
					_id: string,
					name: string,
					world: string,
					coverImage: string,
					contentId: string,
					pageModel: string,
					modelColor: string
				}
			) => {
				const person = context.container.get<Person>(INJECTABLE_TYPES.Person);
				person._id = _id;
				person.name = name;
				person.world = world;
				person.coverImage = coverImage;
				person.contentId = contentId;
				person.pageModel = pageModel;
				person.modelColor = modelColor;
				return person;
			}
	);
container
	.bind<PinFactory>(INJECTABLE_TYPES.PinFactory)
	.toFactory((context): PinFactory =>
		(
			{_id, x, y, map, page}: {_id: string, x: number, y: number, map: string, page: string}
		) => {
			const pin = context.container.get<Pin>(INJECTABLE_TYPES.Pin);
			pin._id = _id;
			pin.x = x;
			pin.y = y;
			pin.map = map;
			pin.page = page;
			return pin;
	});
container
	.bind<PlaceFactory>(INJECTABLE_TYPES.PlaceFactory)
	.toFactory(
		(context) =>
			(
				{
					_id,
					name,
					world,
					coverImage,
					contentId,
					mapImage,
					pixelsPerFoot
				}:{
					_id: string,
					name: string,
					world: string,
					coverImage: string,
					contentId: string,
					mapImage: string,
					pixelsPerFoot: number
				}
			) => {
				const place = context.container.get<Place>(INJECTABLE_TYPES.Place);
				place._id = _id;
				place.name = name;
				place.world = world;
				place.coverImage = coverImage;
				place.contentId = contentId;
				place.mapImage = mapImage;
				place.pixelsPerFoot = pixelsPerFoot;
				return place;
			}
	);
container
	.bind<RoleFactory>(INJECTABLE_TYPES.RoleFactory)
	.toFactory((context): RoleFactory =>
		(
			{
				_id,
				name,
				world,
				permissions
			}:{
				_id: string,
				name: string,
				world: string,
				permissions: string[]
			}
		) => {
			const role = context.container.get<Role>(INJECTABLE_TYPES.Role);
			role._id = _id;
			role.name = name;
			role.world = world;
			role.permissions = permissions;
			return role;
		});
container
	.bind<ServerConfigFactory>(INJECTABLE_TYPES.ServerConfigFactory)
	.toFactory(
		(context):ServerConfigFactory =>
			(
				{
					_id,
					version,
					registerCodes,
					adminUsers,
					unlockCode
				}:{
					_id: string,
					version: string,
					registerCodes: string[],
					adminUsers: string[],
					unlockCode: string
				}
			) => {
				const serverConfig = context.container.get<ServerConfig>(INJECTABLE_TYPES.ServerConfig);
				serverConfig._id = _id;
				serverConfig.version = version;
				serverConfig.registerCodes = registerCodes;
				serverConfig.adminUsers = adminUsers;
				serverConfig.unlockCode = unlockCode;
				return serverConfig;
			}
	);
container
	.bind<UserFactory>(INJECTABLE_TYPES.UserFactory)
	.toFactory(
		(context) =>
			(
				{
					_id,
					email,
					username,
					password,
					tokenVersion,
					currentWorld,
					roles,
					permissions
				}:{
					_id: string,
					email: string,
					username: string,
					password: string,
					tokenVersion: string,
					currentWorld: string,
					roles: string[],
					permissions: string[]
				}
			) => {
				const user = context.container.get<User>(INJECTABLE_TYPES.User);
				user._id = _id;
				user.email = email;
				user.username = username;
				user.password = password;
				user.tokenVersion = tokenVersion;
				user.currentWorld = currentWorld;
				user.roles = roles;
				user.permissions = permissions;
				return user;
			}
	);
container
	.bind<WikiFolderFactory>(INJECTABLE_TYPES.WikiFolderFactory)
	.toFactory(
		(context): WikiFolderFactory =>
			(
				{
					_id,
					name,
					world,
					pages,
					children
				}:{
					_id: string,
					name: string,
					world: string,
					pages: string[],
					children: string[]
				}
			) => {
				const folder = context.container.get<WikiFolder>(INJECTABLE_TYPES.WikiFolder);
				folder._id = _id;
				folder.name = name;
				folder.world = world;
				folder.pages = pages;
				folder.children = children;
				return folder;
			}
	);
container
	.bind<WorldFactory>(INJECTABLE_TYPES.WorldFactory)
	.toFactory(
		(context): WorldFactory =>
			(
				{
					_id,
					name,
					wikiPage,
					rootFolder,
					roles,
					pins
				}:{
					_id: string,
					name: string,
					wikiPage: string,
					rootFolder: string,
					roles: string[],
					pins: string[]
				}
			) => {
				const world = context.container.get<World>(INJECTABLE_TYPES.World);
				world._id = _id;
				world.name = name;
				world.wikiPage = wikiPage;
				world.rootFolder = rootFolder;
				world.roles = roles;
				world.pins = pins;
				return world;
			}
	);

// db repositories
container.bind<ArticleRepository>(INJECTABLE_TYPES.ArticleRepository).to(MongodbArticleRepository);
container.bind<ChunkRepository>(INJECTABLE_TYPES.ChunkRepository).to(MongodbChunkRepository);
container.bind<FileRepository>(INJECTABLE_TYPES.FileRepository).to(MongodbFileRepository);
container.bind<GameRepository>(INJECTABLE_TYPES.GameRepository).to(MongodbGameRepository);
container.bind<ImageRepository>(INJECTABLE_TYPES.ImageRepository).to(MongodbImageRepository);
container.bind<ItemRepository>(INJECTABLE_TYPES.ItemRepository).to(MongodbItemRepository);
container.bind<ModelRepository>(INJECTABLE_TYPES.ModelRepository).to(MongodbModelRepository);
container.bind<MonsterRepository>(INJECTABLE_TYPES.MonsterRepository).to(MongodbMonsterRepository);
container
	.bind<PermissionAssignmentRepository>(INJECTABLE_TYPES.PermissionAssignmentRepository)
	.to(MongodbPermissionAssignmentRepository);
container.bind<PersonRepository>(INJECTABLE_TYPES.PersonRepository).to(MongodbPersonRepository);
container.bind<PinRepository>(INJECTABLE_TYPES.PinRepository).to(MongodbPinRepository);
container.bind<PlaceRepository>(INJECTABLE_TYPES.PlaceRepository).to(MongodbPlaceRepository);
container.bind<RoleRepository>(INJECTABLE_TYPES.RoleRepository).to(MongodbRoleRepository);
container
	.bind<ServerConfigRepository>(INJECTABLE_TYPES.ServerConfigRepository)
	.to(MongodbServerConfigRepository);
container.bind<UserRepository>(INJECTABLE_TYPES.UserRepository).to(MongodbUserRepository);
container
	.bind<WikiFolderRepository>(INJECTABLE_TYPES.WikiFolderRepository)
	.to(MongodbWikiFolderRepository);
container
	.bind<WikiPageRepository>(INJECTABLE_TYPES.WikiPageRepository)
	.to(MongodbWikiPageRepository);
container.bind<WorldRepository>(INJECTABLE_TYPES.WorldRepository).to(MongodbWorldRepository);

// authorization rule sets
container
	.bind<ArticleAuthorizationPolicy>(INJECTABLE_TYPES.ArticleAuthorizationPolicy)
	.to(ArticleAuthorizationPolicy);
container
	.bind<ChunkAuthorizationPolicy>(INJECTABLE_TYPES.ChunkAuthorizationPolicy)
	.to(ChunkAuthorizationPolicy);
container
	.bind<FileAuthorizationPolicy>(INJECTABLE_TYPES.FileAuthorizationPolicy)
	.to(FileAuthorizationPolicy);
container
	.bind<GameAuthorizationPolicy>(INJECTABLE_TYPES.GameAuthorizationPolicy)
	.to(GameAuthorizationPolicy);
container
	.bind<ImageAuthorizationPolicy>(INJECTABLE_TYPES.ImageAuthorizationPolicy)
	.to(ImageAuthorizationPolicy);
container
	.bind<ItemAuthorizationPolicy>(INJECTABLE_TYPES.ItemAuthorizationPolicy)
	.to(ItemAuthorizationPolicy);
container
	.bind<ModelAuthorizationPolicy>(INJECTABLE_TYPES.ModelAuthorizationPolicy)
	.to(ModelAuthorizationPolicy);
container
	.bind<MonsterAuthorizationPolicy>(INJECTABLE_TYPES.MonsterAuthorizationPolicy)
	.to(MonsterAuthorizationPolicy);
container
	.bind<PermissionAssignmentAuthorizationPolicy>(
		INJECTABLE_TYPES.PermissionAssignmentAuthorizationPolicy
	)
	.to(PermissionAssignmentAuthorizationPolicy);
container
	.bind<PersonAuthorizationPolicy>(INJECTABLE_TYPES.PersonAuthorizationPolicy)
	.to(PersonAuthorizationPolicy);
container
	.bind<PinAuthorizationPolicy>(INJECTABLE_TYPES.PinAuthorizationPolicy)
	.to(PinAuthorizationPolicy);
container
	.bind<PlaceAuthorizationPolicy>(INJECTABLE_TYPES.PlaceAuthorizationPolicy)
	.to(PlaceAuthorizationPolicy);
container
	.bind<RoleAuthorizationPolicy>(INJECTABLE_TYPES.RoleAuthorizationPolicy)
	.to(RoleAuthorizationPolicy);
container
	.bind<ServerConfigAuthorizationPolicy>(INJECTABLE_TYPES.ServerConfigAuthorizationPolicy)
	.to(ServerConfigAuthorizationPolicy);
container
	.bind<UserAuthorizationPolicy>(INJECTABLE_TYPES.UserAuthorizationPolicy)
	.to(UserAuthorizationPolicy);
container
	.bind<WikiFolderAuthorizationPolicy>(INJECTABLE_TYPES.WikiFolderAuthorizationPolicy)
	.to(WikiFolderAuthorizationPolicy);
container
	.bind<WikiPageAuthorizationPolicy>(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
	.to(WikiPageAuthorizationPolicy);
container
	.bind<WorldAuthorizationPolicy>(INJECTABLE_TYPES.WorldAuthorizationPolicy)
	.to(WorldAuthorizationPolicy);

// archive repositories
container
	.bind<ArticleRepository>(INJECTABLE_TYPES.ArchiveArticleRepository)
	.to(InMemoryArticleRepository);
container
	.bind<ChunkRepository>(INJECTABLE_TYPES.ArchiveChunkRepository)
	.to(InMemoryChunkRepository);
container.bind<FileRepository>(INJECTABLE_TYPES.ArchiveFileRepository).to(InMemoryFileRepository);
container.bind<GameRepository>(INJECTABLE_TYPES.ArchiveGameRepository).to(InMemoryGameRepository);
container
	.bind<ImageRepository>(INJECTABLE_TYPES.ArchiveImageRepository)
	.to(InMemoryImageRepository);
container.bind<ItemRepository>(INJECTABLE_TYPES.ArchiveItemRepository).to(InMemoryItemRepository);
container
	.bind<ModelRepository>(INJECTABLE_TYPES.ArchiveModelRepository)
	.to(InMemoryModelRepository);
container
	.bind<MonsterRepository>(INJECTABLE_TYPES.ArchiveMonsterRepository)
	.to(InMemoryMonsterRepository);
container
	.bind<PermissionAssignmentRepository>(INJECTABLE_TYPES.ArchivePermissionAssignmentRepository)
	.to(InMemoryPermissionAssignmentRepository);
container
	.bind<PersonRepository>(INJECTABLE_TYPES.ArchivePersonRepository)
	.to(InMemoryPersonRepository);
container.bind<PinRepository>(INJECTABLE_TYPES.ArchivePinRepository).to(InMemoryPinRepository);
container
	.bind<PlaceRepository>(INJECTABLE_TYPES.ArchivePlaceRepository)
	.to(InMemoryPlaceRepository);
container.bind<RoleRepository>(INJECTABLE_TYPES.ArchiveRoleRepository).to(InMemoryRoleRepository);
container
	.bind<ServerConfigRepository>(INJECTABLE_TYPES.ArchiveServerConfigRepository)
	.to(InMemoryServerConfigRepository);
container.bind<UserRepository>(INJECTABLE_TYPES.ArchiveUserRepository).to(InMemoryUserRepository);
container
	.bind<WikiFolderRepository>(INJECTABLE_TYPES.ArchiveWikiFolderRepository)
	.to(InMemoryWikiFolderRepository);
container
	.bind<WikiPageRepository>(INJECTABLE_TYPES.ArchiveWikiPageRepository)
	.to(InMemoryWikiPageRepository);
container
	.bind<WorldRepository>(INJECTABLE_TYPES.ArchiveWorldRepository)
	.to(InMemoryWorldRepository);

// services
container
	.bind<AuthenticationService>(INJECTABLE_TYPES.AuthenticationService)
	.to(AuthenticationService);
container
	.bind<AuthorizationService>(INJECTABLE_TYPES.AuthorizationService)
	.to(AuthorizationService);
container
	.bind<ContentExportService>(INJECTABLE_TYPES.ContentExportService)
	.to(ContentExportService);
container
	.bind<ContentImportService>(INJECTABLE_TYPES.ContentImportService)
	.to(ContentImportService);
container.bind<GameService>(INJECTABLE_TYPES.GameService).to(GameService);
container.bind<ImageService>(INJECTABLE_TYPES.ImageService).to(ImageService);
container.bind<ModelService>(INJECTABLE_TYPES.ModelService).to(ModelService);
container
	.bind<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService)
	.to(ServerConfigService);
container.bind<SrdImportService>(INJECTABLE_TYPES.SrdImportService).to(SrdImportService);
container.bind<UserService>(INJECTABLE_TYPES.UserService).to(UserService);
container
	.bind<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService)
	.to(WikiFolderService);
container.bind<WikiPageService>(INJECTABLE_TYPES.WikiPageService).to(WikiPageService);
container.bind<WorldService>(INJECTABLE_TYPES.WorldService).to(WorldService);
container.bind<RoleService>(INJECTABLE_TYPES.RoleService).to(RoleService);

// session contexts
container
	.bind<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory)
	.to(ExpressSessionContextFactory);
container
	.bind<SecurityContextFactory>(INJECTABLE_TYPES.SecurityContextFactory)
	.to(SecurityContextFactory);

// open 5e
container.bind<Open5eApiClient>(INJECTABLE_TYPES.Open5eApiClient).to(Open5eApiClient);
container.bind<Dnd5eApiClient>(INJECTABLE_TYPES.Dnd5eApiClient).to(Dnd5eApiClient);

// delta
container.bind<DeltaFactory>(INJECTABLE_TYPES.DeltaFactory).to(DeltaFactory);

// cache
if(process.env.REDIS_URL)
	container.bind<Cache>(INJECTABLE_TYPES.Cache).to(RedisClient);
else
	container.bind<Cache>(INJECTABLE_TYPES.Cache).to(NoCacheClient);

// archive factory
container.bind<AbstractArchiveFactory>(INJECTABLE_TYPES.ArchiveFactory).to(ArchiveFactory);

container.bind<ZipArchive>(INJECTABLE_TYPES.ZipArchive).to(ZipArchive);
container.bind<Factory<ZipArchive>>(INJECTABLE_TYPES.ZipArchiveFactory).toFactory((context) => () => {
	return context.container.get<ZipArchive>(INJECTABLE_TYPES.ZipArchive);
});

// event publisher
container
	.bind<EventPublisher>(INJECTABLE_TYPES.EventPublisher)
	.to(ApolloExpressEventPublisher)
	.inSingletonScope();

// server
// not a singleton so tests can run concurrently and have multiple server instances
container.bind<ApiServer>(INJECTABLE_TYPES.ApiServer).to(ExpressApiServer);
container.bind<ServerProperties>(INJECTABLE_TYPES.ServerProperties).to(ServerProperties).inSingletonScope();

// data loaders
container.bind<DataLoader<Article>>(INJECTABLE_TYPES.ArticleDataLoader).to(ArticleDataLoader);
container.bind<DataLoader<Chunk>>(INJECTABLE_TYPES.ChunkDataLoader).to(ChunkDataLoader);
container.bind<DataLoader<File>>(INJECTABLE_TYPES.FileDataLoader).to(FileDataLoader);
container.bind<DataLoader<Game>>(INJECTABLE_TYPES.GameDataLoader).to(GameDataLoader);
container.bind<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader).to(ImageDataLoader);
container.bind<DataLoader<Item>>(INJECTABLE_TYPES.ItemDataLoader).to(ItemDataLoader);
container.bind<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader).to(ModelDataLoader);
container.bind<DataLoader<Monster>>(INJECTABLE_TYPES.MonsterDataLoader).to(MonsterDataLoader);
container
	.bind<DataLoader<PermissionAssignment>>(INJECTABLE_TYPES.PermissionAssignmentDataLoader)
	.to(PermissionAssignmentDataLoader);
container.bind<DataLoader<Person>>(INJECTABLE_TYPES.PersonDataLoader).to(PersonDataLoader);
container.bind<DataLoader<Pin>>(INJECTABLE_TYPES.PinDataLoader).to(PinDataLoader);
container.bind<DataLoader<Place>>(INJECTABLE_TYPES.PlaceDataLoader).to(PlaceDataLoader);
container.bind<DataLoader<Role>>(INJECTABLE_TYPES.RoleDataLoader).to(RoleDataLoader);
container
	.bind<DataLoader<ServerConfig>>(INJECTABLE_TYPES.ServerConfigDataLoader)
	.to(ServerConfigDataLoader);
container.bind<DataLoader<User>>(INJECTABLE_TYPES.UserDataLoader).to(UserDataLoader);
container
	.bind<DataLoader<WikiFolder>>(INJECTABLE_TYPES.WikiFolderDataLoader)
	.to(WikiFolderDataLoader);
container.bind<DataLoader<WikiPage>>(INJECTABLE_TYPES.WikiPageDataLoader).to(WikiPageDataLoader);
container.bind<DataLoader<World>>(INJECTABLE_TYPES.WorldDataLoader).to(WorldDataLoader);

// seeders
container.bind<RoleSeeder>(INJECTABLE_TYPES.RoleSeeder).to(RoleSeeder);
container.bind<ServerConfigSeeder>(INJECTABLE_TYPES.ServerConfigSeeder).to(ServerConfigSeeder);

// unit of work
container.bind<DbUnitOfWork>(INJECTABLE_TYPES.DbUnitOfWork).to(DbUnitOfWork);
container
	.bind<Factory<DbUnitOfWork>>(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	.toFactory((context) => () => context.container.get<DbUnitOfWork>(INJECTABLE_TYPES.DbUnitOfWork));

// repo mapper
container.bind<RepositoryMapper>(INJECTABLE_TYPES.RepositoryMapper).to(RepositoryMapper);

container.bind<FilterFactory>(INJECTABLE_TYPES.FilterFactory).to(FilterFactory);

export { container };
