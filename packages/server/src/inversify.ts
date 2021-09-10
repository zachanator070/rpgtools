import "reflect-metadata";
import { Container } from "inversify";
import {
	ArticleRepository,
	AuthenticationService,
	AuthorizationService,
	ChunkRepository,
	ContentExportService,
	ContentImportService,
	EventPublisher,
	FileRepository,
	GameRepository,
	GameService,
	ImageRepository,
	ImageService,
	ItemRepository,
	ModelRepository,
	ModelService,
	MonsterRepository,
	PermissionAssignmentRepository,
	PersonRepository,
	PinRepository,
	PlaceRepository,
	RoleRepository,
	ServerConfigRepository,
	ServerConfigService,
	SessionContextFactory,
	SrdImportService,
	UserRepository,
	UserService,
	WikiFolderRepository,
	WikiFolderService,
	WikiPageRepository,
	WikiPageService,
	WorldRepository,
	WorldService,
	Cache,
	AbstractArchiveFactory,
	ApiServer,
	DataLoader,
	Factory,
} from "./types";
import { INJECTABLE_TYPES } from "./injectable-types";
import { MongodbArticleRepository } from "./dal/mongodb/repositories/mongodb-article-repository";
import { ApolloExpressEventPublisher } from "./apollo-express-event-publisher";
import { MongodbChunkRepository } from "./dal/mongodb/repositories/mongodb-chunk-repository";
import { MongodbGameRepository } from "./dal/mongodb/repositories/mongodb-game-repository";
import { MongodbItemRepository } from "./dal/mongodb/repositories/mongodb-item-repository";
import { MongodbFileRepository } from "./dal/mongodb/repositories/mongodb-file-repository";
import { MongodbWorldRepository } from "./dal/mongodb/repositories/mongodb-world-repository";
import { MongodbWikiPageRepository } from "./dal/mongodb/repositories/mongodb-wiki-page-repository";
import { MongodbWikiFolderRepository } from "./dal/mongodb/repositories/mongodb-wiki-folder-repository";
import { MongodbUserRepository } from "./dal/mongodb/repositories/mongodb-user-repository";
import { MongodbServerConfigRepository } from "./dal/mongodb/repositories/mongodb-server-config-repository";
import { MongodbRoleRepository } from "./dal/mongodb/repositories/mongodb-role-repository";
import { MongodbPlaceRepository } from "./dal/mongodb/repositories/mongodb-place-repository";
import { MongodbPinRepository } from "./dal/mongodb/repositories/mongodb-pin-repository";
import { MongodbPersonRepository } from "./dal/mongodb/repositories/mongodb-person-repository";
import { MongodbPermissionAssignmentRepository } from "./dal/mongodb/repositories/mongodb-permission-assignment-repository";
import { MongodbMonsterRepository } from "./dal/mongodb/repositories/mongodb-monster-repository";
import { MongodbModelRepository } from "./dal/mongodb/repositories/mongodb-model-repository";
import { MongodbImageRepository } from "./dal/mongodb/repositories/mongodb-image-repository";
import { InMemoryArticleRepository } from "./dal/in-memory/repositories/in-memory-article-repository";
import { InMemoryChunkRepository } from "./dal/in-memory/repositories/in-memory-chunk-repository";
import { InMemoryGameRepository } from "./dal/in-memory/repositories/in-memory-game-repository";
import { InMemoryImageRepository } from "./dal/in-memory/repositories/in-memory-image-repository";
import { InMemoryItemRepository } from "./dal/in-memory/repositories/in-memory-item-repository";
import { InMemoryModelRepository } from "./dal/in-memory/repositories/in-memory-model-repository";
import { InMemoryMonsterRepository } from "./dal/in-memory/repositories/in-memory-monster-repository";
import { InMemoryPermissionAssignmentRepository } from "./dal/in-memory/repositories/in-memory-permission-assignment-repository";
import { InMemoryPersonRepository } from "./dal/in-memory/repositories/in-memory-person-repository";
import { InMemoryPinRepository } from "./dal/in-memory/repositories/in-memory-pin-repository";
import { InMemoryPlaceRepository } from "./dal/in-memory/repositories/in-memory-place-repository";
import { InMemoryRoleRepository } from "./dal/in-memory/repositories/in-memory-role-repository";
import { InMemoryServerConfigRepository } from "./dal/in-memory/repositories/in-memory-server-config-repository";
import { InMemoryUserRepository } from "./dal/in-memory/repositories/in-memory-user-repository";
import { InMemoryWikiFolderRepository } from "./dal/in-memory/repositories/in-memory-wiki-folder-repository";
import { InMemoryWikiPageRepository } from "./dal/in-memory/repositories/in-memory-wiki-page-repository";
import { InMemoryWorldRepository } from "./dal/in-memory/repositories/in-memory-world-repository";
import { InMemoryFileRepository } from "./dal/in-memory/repositories/in-memory-file-repository";
import { AuthenticationApplicationService } from "./services/authentication-application-service";
import { AuthorizationApplicationService } from "./services/authorization-application-service";
import { ContentExportApplicationService } from "./services/content-export-application-service";
import { ContentImportApplicationService } from "./services/content-import-application-service";
import { GameApplicationService } from "./services/game-application-service";
import { ImageApplicationService } from "./services/image-application-service";
import { ModelApplicationService } from "./services/model-application-service";
import { ServerConfigApplicationService } from "./services/server-config-application-service";
import { SrdImportApplicationService } from "./services/srd-import-application-service";
import { UserApplicationService } from "./services/user-application-service";
import { WikiFolderApplicationService } from "./services/wiki-folder-application-service";
import { WikiPageApplicationService } from "./services/wiki-page-application-service";
import { WorldApplicationService } from "./services/world-application-service";
import { ExpressSessionContextFactory } from "./express-session-context-factory";
import { Open5eApiClient } from "./five-e-import/open-5e-api-client";
import { RedisClient } from "./dal/cache/redis-client";
import { ArchiveFactory } from "./archive/archive-factory";
import { ExpressApiServer } from "./express-api-server";
import { Article } from "./domain-entities/article";
import { ArticleDataLoader } from "./dal/dataloaders/article-data-loader";
import { Chunk } from "./domain-entities/chunk";
import { File } from "./domain-entities/file";
import { Character, FogStroke, Game, InGameModel, Message, Stroke } from "./domain-entities/game";
import { Image } from "./domain-entities/image";
import { Item } from "./domain-entities/item";
import { Model } from "./domain-entities/model";
import { Monster } from "./domain-entities/monster";
import { PermissionAssignment } from "./domain-entities/permission-assignment";
import { PermissionAssignmentDataLoader } from "./dal/dataloaders/permission-assignment-data-loader";
import { Person } from "./domain-entities/person";
import { Pin } from "./domain-entities/pin";
import { Place } from "./domain-entities/place";
import { Role } from "./domain-entities/role";
import { ServerConfig } from "./domain-entities/server-config";
import { ServerConfigDataLoader } from "./dal/dataloaders/server-config-data-loader";
import { User } from "./domain-entities/user";
import { WikiFolder } from "./domain-entities/wiki-folder";
import { WikiFolderDataLoader } from "./dal/dataloaders/wiki-folder-data-loader";
import { WikiPage } from "./domain-entities/wiki-page";
import { World } from "./domain-entities/world";
import { ChunkDataLoader } from "./dal/dataloaders/chunk-data-loader";
import { FileDataLoader } from "./dal/dataloaders/file-data-loader";
import { GameDataLoader } from "./dal/dataloaders/game-data-loader";
import { ImageDataLoader } from "./dal/dataloaders/image-data-loader";
import { ItemDataLoader } from "./dal/dataloaders/item-data-loader";
import { ModelDataLoader } from "./dal/dataloaders/model-data-loader";
import { MonsterDataLoader } from "./dal/dataloaders/monster-data-loader";
import { PersonDataLoader } from "./dal/dataloaders/person-data-loader";
import { PinDataLoader } from "./dal/dataloaders/pin-data-loader";
import { PlaceDataLoader } from "./dal/dataloaders/place-data-loader";
import { RoleDataLoader } from "./dal/dataloaders/role-data-loader";
import { WikiPageDataLoader } from "./dal/dataloaders/wiki-page-data-loader";
import { WorldDataLoader } from "./dal/dataloaders/world-data-loader";
import { UserDataLoader } from "./dal/dataloaders/user-data-loader";
import { RoleSeeder } from "./seeders/role-seeder";
import { ServerConfigSeeder } from "./seeders/server-config-seeder";
import { DbUnitOfWork } from "./dal/db-unit-of-work";
import { SecurityContextFactory } from "./security-context-factory";
import { ArticleAuthorizationRuleset } from "./security/article-authorization-ruleset";
import { ChunkAuthorizationRuleset } from "./security/chunk-authorization-ruleset";
import { FileAuthorizationRuleset } from "./security/file-authorization-ruleset";
import { GameAuthorizationRuleset } from "./security/game-authorization-ruleset";
import { ImageAuthorizationRuleset } from "./security/image-authorization-ruleset";
import { ItemAuthorizationRuleset } from "./security/item-authorization-ruleset";
import { ModelAuthorizationRuleset } from "./security/model-authorization-ruleset";
import { MonsterAuthorizationRuleset } from "./security/monster-authorization-ruleset";
import { PermissionAssignmentAuthorizationRuleset } from "./security/permission-assignment-authorization-ruleset";
import { PersonAuthorizationRuleset } from "./security/person-authorization-ruleset";
import { PinAuthorizationRuleset } from "./security/pin-authorization-ruleset";
import { PlaceAuthorizationRuleset } from "./security/place-authorization-ruleset";
import { RoleAuthorizationRuleset } from "./security/role-authorization-ruleset";
import { ServerConfigAuthorizationRuleset } from "./security/server-config-authorization-ruleset";
import { UserAuthorizationRuleset } from "./security/user-authorization-ruleset";
import { WikiFolderAuthorizationRuleset } from "./security/wiki-folder-authorization-ruleset";
import { WikiPageAuthorizationRuleset } from "./security/wiki-page-authorization-ruleset";
import { WorldAuthorizationRuleset } from "./security/world-authorization-ruleset";
import { Readable } from "stream";
import { RepositoryMapper } from "./repository-mapper";
import {ServerProperties} from "./server-properties";
import FilterFactory from "./dal/mongodb/FilterFactory";
import {NoCacheClient} from "./dal/cache/no-cache-client";
import {DeltaFactory} from "./five-e-import/delta-factory";
import {Dnd5eApiClient} from "./five-e-import/dnd-5e-api-client";

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

// entity factories
container
	.bind<Factory<Article>>(INJECTABLE_TYPES.ArticleFactory)
	.toFactory(
		(context) =>
			(id: string, name: string, worldId: string, coverImageId: string, contentId: string) => {
				const article = context.container.get<Article>(INJECTABLE_TYPES.Article);
				article._id = id;
				article.name = name;
				article.world = worldId;
				article.coverImage = coverImageId;
				article.contentId = contentId;
				return article;
			}
	);
container
	.bind<Factory<Chunk>>(INJECTABLE_TYPES.ChunkFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				x: number,
				y: number,
				width: number,
				height: number,
				fileId: string,
				imageId: string
			) => {
				const chunk = context.container.get<Chunk>(INJECTABLE_TYPES.Chunk);
				chunk._id = id;
				chunk.x = x;
				chunk.y = y;
				chunk.width = width;
				chunk.height = height;
				chunk.fileId = fileId;
				chunk.image = imageId;
				return chunk;
			}
	);
container
	.bind<Factory<File>>(INJECTABLE_TYPES.FileFactory)
	.toFactory((context) => (id: string, filename: string, readStream: Readable, mimeType = "") => {
		const file = context.container.get<File>(INJECTABLE_TYPES.File);
		file._id = id;
		file.filename = filename;
		file.readStream = readStream;
		file.mimeType = mimeType;
		return file;
	});
container
	.bind<Factory<Game>>(INJECTABLE_TYPES.GameFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				passwordHash: string,
				worldId: string,
				mapId: string,
				characters: Character[],
				strokes: Stroke[],
				fog: FogStroke[],
				messages: Message[],
				models: InGameModel[],
				hostId: string
			) => {
				const game = context.container.get<Game>(INJECTABLE_TYPES.Game);
				game._id = id;
				game.passwordHash = passwordHash;
				game.world = worldId;
				game.map = mapId;
				game.characters = characters;
				game.strokes = strokes;
				game.fog = fog;
				game.messages = messages;
				game.models = models;
				game.host = hostId;
				return game;
			}
	);
container
	.bind<Factory<Image>>(INJECTABLE_TYPES.ImageFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				name: string,
				worldId: string,
				width: number,
				height: number,
				chunkWidth: number,
				chunkHeight: number,
				chunkIds: string[],
				iconId: string
			) => {
				const image = context.container.get<Image>(INJECTABLE_TYPES.Image);
				image._id = id;
				image.name = name;
				image.world = worldId;
				image.width = width;
				image.height = height;
				image.chunkWidth = chunkWidth;
				image.chunkHeight = chunkHeight;
				image.chunks = chunkIds;
				image.icon = iconId;
				return image;
			}
	);
container
	.bind<Factory<Item>>(INJECTABLE_TYPES.ItemFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				name: string,
				world: string,
				coverImageId: string,
				contentId: string,
				modelId: string,
				modelColor: string
			) => {
				const item = context.container.get<Item>(INJECTABLE_TYPES.Item);
				item._id = id;
				item.name = name;
				item.world = world;
				item.coverImage = coverImageId;
				item.contentId = contentId;
				item.model = modelId;
				item.modelColor = modelColor;
				return item;
			}
	);

container
	.bind<Factory<Model>>(INJECTABLE_TYPES.ModelFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				worldId: string,
				name: string,
				depth: number,
				width: number,
				height: number,
				fileName: string,
				fileId: string,
				notes: string
			) => {
				const model = context.container.get<Model>(INJECTABLE_TYPES.Model);
				model._id = id;
				model.world = worldId;
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
	.bind<Factory<Monster>>(INJECTABLE_TYPES.MonsterFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				name: string,
				world: string,
				coverImageId: string,
				contentId: string,
				modelId: string,
				modelColor: string
			) => {
				const monster = context.container.get<Monster>(INJECTABLE_TYPES.Monster);
				monster._id = id;
				monster.name = name;
				monster.world = world;
				monster.coverImage = coverImageId;
				monster.contentId = contentId;
				monster.model = modelId;
				monster.modelColor = modelColor;
				return monster;
			}
	);
container
	.bind<Factory<PermissionAssignment>>(INJECTABLE_TYPES.PermissionAssignmentFactory)
	.toFactory(
		(context) => (id: string, permission: string, subject: string, subjectType: string) => {
			const permissionAssignment = context.container.get<PermissionAssignment>(
				INJECTABLE_TYPES.PermissionAssignment
			);
			permissionAssignment._id = id;
			permissionAssignment.permission = permission;
			permissionAssignment.subject = subject;
			permissionAssignment.subjectType = subjectType;
			return permissionAssignment;
		}
	);
container
	.bind<Factory<Person>>(INJECTABLE_TYPES.PersonFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				name: string,
				world: string,
				coverImageId: string,
				contentId: string,
				modelId: string,
				modelColor: string
			) => {
				const person = context.container.get<Person>(INJECTABLE_TYPES.Person);
				person._id = id;
				person.name = name;
				person.world = world;
				person.coverImage = coverImageId;
				person.contentId = contentId;
				person.model = modelId;
				person.modelColor = modelColor;
				return person;
			}
	);
container
	.bind<Factory<Pin>>(INJECTABLE_TYPES.PinFactory)
	.toFactory((context) => (id: string, x: number, y: number, mapId: string, pageId: string) => {
		const pin = context.container.get<Pin>(INJECTABLE_TYPES.Pin);
		pin._id = id;
		pin.x = x;
		pin.y = y;
		pin.map = mapId;
		pin.page = pageId;
		return pin;
	});
container
	.bind<Factory<Place>>(INJECTABLE_TYPES.PlaceFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				name: string,
				worldId: string,
				coverImageId: string,
				contentId: string,
				mapImageId: string,
				pixelsPerFoot: number
			) => {
				const place = context.container.get<Place>(INJECTABLE_TYPES.Place);
				place._id = id;
				place.name = name;
				place.world = worldId;
				place.coverImage = coverImageId;
				place.contentId = contentId;
				place.mapImage = mapImageId;
				place.pixelsPerFoot = pixelsPerFoot;
				return place;
			}
	);
container
	.bind<Factory<Role>>(INJECTABLE_TYPES.RoleFactory)
	.toFactory((context) => (id: string, name: string, worldId: string, permissionIds: string[]) => {
		const role = context.container.get<Role>(INJECTABLE_TYPES.Role);
		role._id = id;
		role.name = name;
		role.world = worldId;
		role.permissions = permissionIds;
		return role;
	});
container
	.bind<Factory<ServerConfig>>(INJECTABLE_TYPES.ServerConfigFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				version: string,
				registerCodes: string[],
				adminUserIds: string[],
				unlockCode: string
			) => {
				const serverConfig = context.container.get<ServerConfig>(INJECTABLE_TYPES.ServerConfig);
				serverConfig._id = id;
				serverConfig.version = version;
				serverConfig.registerCodes = registerCodes;
				serverConfig.adminUsers = adminUserIds;
				serverConfig.unlockCode = unlockCode;
				return serverConfig;
			}
	);
container
	.bind<Factory<User>>(INJECTABLE_TYPES.UserFactory)
	.toFactory(
		(context) =>
			(
				_id: string,
				email: string,
				username: string,
				password: string,
				tokenVersion: string,
				currentWorldId: string,
				roleIds: string[],
				permissionIds: string[]
			) => {
				const user = context.container.get<User>(INJECTABLE_TYPES.User);
				user._id = _id;
				user.email = email;
				user.username = username;
				user.password = password;
				user.tokenVersion = tokenVersion;
				user.currentWorld = currentWorldId;
				user.roles = roleIds;
				user.permissions = permissionIds;
				return user;
			}
	);
container
	.bind<Factory<WikiFolder>>(INJECTABLE_TYPES.WikiFolderFactory)
	.toFactory(
		(context) =>
			(id: string, name: string, worldId: string, pageIds: string[], childrenIds: string[]) => {
				const folder = context.container.get<WikiFolder>(INJECTABLE_TYPES.WikiFolder);
				folder._id = id;
				folder.name = name;
				folder.world = worldId;
				folder.pages = pageIds;
				folder.children = childrenIds;
				return folder;
			}
	);
container
	.bind<Factory<World>>(INJECTABLE_TYPES.WorldFactory)
	.toFactory(
		(context) =>
			(
				id: string,
				name: string,
				wikiPageId: string,
				rootFolderId: string,
				roleIds: string[],
				pinIds: string[]
			) => {
				const world = context.container.get<World>(INJECTABLE_TYPES.World);
				world._id = id;
				world.name = name;
				world.wikiPage = wikiPageId;
				world.rootFolder = rootFolderId;
				world.roles = roleIds;
				world.pins = pinIds;
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
	.bind<ArticleAuthorizationRuleset>(INJECTABLE_TYPES.ArticleAuthorizationRuleset)
	.to(ArticleAuthorizationRuleset);
container
	.bind<ChunkAuthorizationRuleset>(INJECTABLE_TYPES.ChunkAuthorizationRuleset)
	.to(ChunkAuthorizationRuleset);
container
	.bind<FileAuthorizationRuleset>(INJECTABLE_TYPES.FileAuthorizationRuleset)
	.to(FileAuthorizationRuleset);
container
	.bind<GameAuthorizationRuleset>(INJECTABLE_TYPES.GameAuthorizationRuleset)
	.to(GameAuthorizationRuleset);
container
	.bind<ImageAuthorizationRuleset>(INJECTABLE_TYPES.ImageAuthorizationRuleset)
	.to(ImageAuthorizationRuleset);
container
	.bind<ItemAuthorizationRuleset>(INJECTABLE_TYPES.ItemAuthorizationRuleset)
	.to(ItemAuthorizationRuleset);
container
	.bind<ModelAuthorizationRuleset>(INJECTABLE_TYPES.ModelAuthorizationRuleset)
	.to(ModelAuthorizationRuleset);
container
	.bind<MonsterAuthorizationRuleset>(INJECTABLE_TYPES.MonsterAuthorizationRuleset)
	.to(MonsterAuthorizationRuleset);
container
	.bind<PermissionAssignmentAuthorizationRuleset>(
		INJECTABLE_TYPES.PermissionAssignmentAuthorizationRuleset
	)
	.to(PermissionAssignmentAuthorizationRuleset);
container
	.bind<PersonAuthorizationRuleset>(INJECTABLE_TYPES.PersonAuthorizationRuleset)
	.to(PersonAuthorizationRuleset);
container
	.bind<PinAuthorizationRuleset>(INJECTABLE_TYPES.PinAuthorizationRuleset)
	.to(PinAuthorizationRuleset);
container
	.bind<PlaceAuthorizationRuleset>(INJECTABLE_TYPES.PlaceAuthorizationRuleset)
	.to(PlaceAuthorizationRuleset);
container
	.bind<RoleAuthorizationRuleset>(INJECTABLE_TYPES.RoleAuthorizationRuleset)
	.to(RoleAuthorizationRuleset);
container
	.bind<ServerConfigAuthorizationRuleset>(INJECTABLE_TYPES.ServerConfigAuthorizationRuleset)
	.to(ServerConfigAuthorizationRuleset);
container
	.bind<UserAuthorizationRuleset>(INJECTABLE_TYPES.UserAuthorizationRuleset)
	.to(UserAuthorizationRuleset);
container
	.bind<WikiFolderAuthorizationRuleset>(INJECTABLE_TYPES.WikiFolderAuthorizationRuleset)
	.to(WikiFolderAuthorizationRuleset);
container
	.bind<WikiPageAuthorizationRuleset>(INJECTABLE_TYPES.WikiPageAuthorizationRuleset)
	.to(WikiPageAuthorizationRuleset);
container
	.bind<WorldAuthorizationRuleset>(INJECTABLE_TYPES.WorldAuthorizationRuleset)
	.to(WorldAuthorizationRuleset);

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
	.to(AuthenticationApplicationService);
container
	.bind<AuthorizationService>(INJECTABLE_TYPES.AuthorizationService)
	.to(AuthorizationApplicationService);
container
	.bind<ContentExportService>(INJECTABLE_TYPES.ContentExportService)
	.to(ContentExportApplicationService);
container
	.bind<ContentImportService>(INJECTABLE_TYPES.ContentImportService)
	.to(ContentImportApplicationService);
container.bind<GameService>(INJECTABLE_TYPES.GameService).to(GameApplicationService);
container.bind<ImageService>(INJECTABLE_TYPES.ImageService).to(ImageApplicationService);
container.bind<ModelService>(INJECTABLE_TYPES.ModelService).to(ModelApplicationService);
container
	.bind<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService)
	.to(ServerConfigApplicationService);
container.bind<SrdImportService>(INJECTABLE_TYPES.SrdImportService).to(SrdImportApplicationService);
container.bind<UserService>(INJECTABLE_TYPES.UserService).to(UserApplicationService);
container
	.bind<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService)
	.to(WikiFolderApplicationService);
container.bind<WikiPageService>(INJECTABLE_TYPES.WikiPageService).to(WikiPageApplicationService);
container.bind<WorldService>(INJECTABLE_TYPES.WorldService).to(WorldApplicationService);

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

// event publisher
container
	.bind<EventPublisher>(INJECTABLE_TYPES.EventPublisher)
	.to(ApolloExpressEventPublisher)
	.inSingletonScope();

// server
container.bind<ApiServer>(INJECTABLE_TYPES.ApiServer).to(ExpressApiServer).inSingletonScope();
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
