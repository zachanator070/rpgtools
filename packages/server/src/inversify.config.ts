import "reflect-metadata";
import { Container, interfaces } from "inversify";
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
import { RedisClient } from "./redis-client";
import { ArchiveFactory } from "./archive/archive-factory";
import { ExpressApiServer } from "./express-api-server";
import { Article } from "./domain-entities/article";
import { ArticleDataLoader } from "./dal/dataloaders/article-data-loader";
import { Chunk } from "./domain-entities/chunk";
import { File } from "./domain-entities/file";
import { Game } from "./domain-entities/game";
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

const container = new Container();
container.bind<ArticleRepository>(INJECTABLE_TYPES.ArticleRepository).to(MongodbArticleRepository);
container.bind<ChunkRepository>(INJECTABLE_TYPES.ChunkRepository).to(MongodbChunkRepository);
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
container.bind<FileRepository>(INJECTABLE_TYPES.FileRepository).to(MongodbFileRepository);

container
	.bind<ArticleRepository>(INJECTABLE_TYPES.ArchiveArticleRepository)
	.to(InMemoryArticleRepository);
container
	.bind<ChunkRepository>(INJECTABLE_TYPES.ArchiveChunkRepository)
	.to(InMemoryChunkRepository);
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
container.bind<FileRepository>(INJECTABLE_TYPES.ArchiveFileRepository).to(InMemoryFileRepository);

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

container
	.bind<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory)
	.to(ExpressSessionContextFactory);

container.bind<Open5eApiClient>(INJECTABLE_TYPES.Open5eApiClient).to(Open5eApiClient);

container.bind<Cache>(INJECTABLE_TYPES.Cache).to(RedisClient);

container.bind<AbstractArchiveFactory>(INJECTABLE_TYPES.ArchiveFactory).to(ArchiveFactory);

container
	.bind<EventPublisher>(INJECTABLE_TYPES.EventPublisher)
	.to(ApolloExpressEventPublisher)
	.inSingletonScope();

container.bind<ApiServer>(INJECTABLE_TYPES.ApiServer).to(ExpressApiServer).inSingletonScope();

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

export { container };
