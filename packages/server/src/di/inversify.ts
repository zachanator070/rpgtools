import "reflect-metadata";
import { Container } from "inversify";
import {
	EventPublisher,
	SessionContextFactory,
	Cache,
	AbstractArchiveFactory,
	ApiServer,
	DataLoader,
	Factory,
	DomainEntity,
	DbEngine
} from "../types";
import { INJECTABLE_TYPES } from "./injectable-types.js";
import { ApolloExpressEventPublisher } from "../server/apollo-express-event-publisher.js";
import { InMemoryArticleRepository } from "../dal/in-memory/repositories/in-memory-article-repository.js";
import { InMemoryChunkRepository } from "../dal/in-memory/repositories/in-memory-chunk-repository.js";
import { InMemoryGameRepository } from "../dal/in-memory/repositories/in-memory-game-repository.js";
import { InMemoryImageRepository } from "../dal/in-memory/repositories/in-memory-image-repository.js";
import { InMemoryItemRepository } from "../dal/in-memory/repositories/in-memory-item-repository.js";
import { InMemoryModelRepository } from "../dal/in-memory/repositories/in-memory-model-repository.js";
import { InMemoryMonsterRepository } from "../dal/in-memory/repositories/in-memory-monster-repository.js";
import { InMemoryPersonRepository } from "../dal/in-memory/repositories/in-memory-person-repository.js";
import { InMemoryPinRepository } from "../dal/in-memory/repositories/in-memory-pin-repository.js";
import { InMemoryPlaceRepository } from "../dal/in-memory/repositories/in-memory-place-repository.js";
import { InMemoryRoleRepository } from "../dal/in-memory/repositories/in-memory-role-repository.js";
import { InMemoryServerConfigRepository } from "../dal/in-memory/repositories/in-memory-server-config-repository.js";
import { InMemoryUserRepository } from "../dal/in-memory/repositories/in-memory-user-repository.js";
import { InMemoryWikiFolderRepository } from "../dal/in-memory/repositories/in-memory-wiki-folder-repository.js";
import { InMemoryWikiPageRepository } from "../dal/in-memory/repositories/in-memory-wiki-page-repository.js";
import { InMemoryWorldRepository } from "../dal/in-memory/repositories/in-memory-world-repository.js";
import { InMemoryFileRepository } from "../dal/in-memory/repositories/in-memory-file-repository.js";
import { AuthenticationService } from "../services/authentication-service.js";
import { AuthorizationService } from "../services/authorization-service.js";
import { ContentExportService } from "../services/content-export-service.js";
import { ContentImportService } from "../services/content-import-service.js";
import { GameService } from "../services/game-service.js";
import { ImageService } from "../services/image-service.js";
import { ModelService } from "../services/model-service.js";
import { ServerConfigService } from "../services/server-config-service.js";
import { UserService } from "../services/user-service.js";
import { WikiFolderService } from "../services/wiki-folder-service.js";
import { WikiPageService } from "../services/wiki-page-service.js";
import { WorldService } from "../services/world-service.js";
import { ExpressSessionContextFactory } from "../server/express-session-context-factory.js";
import { RedisClient } from "../dal/cache/redis-client.js";
import { ArchiveFactory } from "../archive/archive-factory.js";
import { ExpressApiServer } from "../server/express-api-server.js";
import { Article } from "../domain-entities/article.js";
import { ArticleDataLoader } from "../dal/dataloaders/article-data-loader.js";
import { Chunk } from "../domain-entities/chunk.js";
import { File } from "../domain-entities/file.js";
import { Game} from "../domain-entities/game.js";
import { Image } from "../domain-entities/image.js";
import { Item } from "../domain-entities/item.js";
import { Model } from "../domain-entities/model.js";
import { Monster } from "../domain-entities/monster.js";
import { Person } from "../domain-entities/person.js";
import { Pin } from "../domain-entities/pin.js";
import { Place } from "../domain-entities/place.js";
import { Role } from "../domain-entities/role.js";
import { ServerConfig } from "../domain-entities/server-config.js";
import { ServerConfigDataLoader } from "../dal/dataloaders/server-config-data-loader.js";
import { User } from "../domain-entities/user.js";
import { WikiFolder } from "../domain-entities/wiki-folder.js";
import { WikiFolderDataLoader } from "../dal/dataloaders/wiki-folder-data-loader.js";
import { WikiPage } from "../domain-entities/wiki-page.js";
import { World } from "../domain-entities/world.js";
import { ChunkDataLoader } from "../dal/dataloaders/chunk-data-loader.js";
import { FileDataLoader } from "../dal/dataloaders/file-data-loader.js";
import { GameDataLoader } from "../dal/dataloaders/game-data-loader.js";
import { ImageDataLoader } from "../dal/dataloaders/image-data-loader.js";
import { ItemDataLoader } from "../dal/dataloaders/item-data-loader.js";
import { ModelDataLoader } from "../dal/dataloaders/model-data-loader.js";
import { MonsterDataLoader } from "../dal/dataloaders/monster-data-loader.js";
import { PersonDataLoader } from "../dal/dataloaders/person-data-loader.js";
import { PinDataLoader } from "../dal/dataloaders/pin-data-loader.js";
import { PlaceDataLoader } from "../dal/dataloaders/place-data-loader.js";
import { RoleDataLoader } from "../dal/dataloaders/role-data-loader.js";
import { WikiPageDataLoader } from "../dal/dataloaders/wiki-page-data-loader.js";
import { WorldDataLoader } from "../dal/dataloaders/world-data-loader.js";
import { UserDataLoader } from "../dal/dataloaders/user-data-loader.js";
import { RoleSeeder } from "../seeders/role-seeder.js";
import { ServerConfigSeeder } from "../seeders/server-config-seeder.js";
import { SecurityContextFactory } from "../security/security-context-factory.js";
import { ArticleAuthorizationPolicy } from "../security/policy/article-authorization-policy.js";
import { ChunkAuthorizationPolicy } from "../security/policy/chunk-authorization-policy.js";
import { FileAuthorizationPolicy } from "../security/policy/file-authorization-policy.js";
import { GameAuthorizationPolicy } from "../security/policy/game-authorization-policy.js";
import { ImageAuthorizationPolicy } from "../security/policy/image-authorization-policy.js";
import { ItemAuthorizationPolicy } from "../security/policy/item-authorization-policy.js";
import { ModelAuthorizationPolicy } from "../security/policy/model-authorization-policy.js";
import { MonsterAuthorizationPolicy } from "../security/policy/monster-authorization-policy.js";
import { PersonAuthorizationPolicy } from "../security/policy/person-authorization-policy.js";
import { PinAuthorizationPolicy } from "../security/policy/pin-authorization-policy.js";
import { PlaceAuthorizationPolicy } from "../security/policy/place-authorization-policy.js";
import { RoleAuthorizationPolicy } from "../security/policy/role-authorization-policy.js";
import { ServerConfigAuthorizationPolicy } from "../security/policy/server-config-authorization-policy.js";
import { UserAuthorizationPolicy } from "../security/policy/user-authorization-policy.js";
import { WikiFolderAuthorizationPolicy } from "../security/policy/wiki-folder-authorization-policy.js";
import { WikiPageAuthorizationPolicy } from "../security/policy/wiki-page-authorization-policy.js";
import { WorldAuthorizationPolicy } from "../security/policy/world-authorization-policy.js";
import {ServerProperties} from "../server/server-properties.js";
import {NoCacheClient} from "../dal/cache/no-cache-client.js";
import {RoleService} from "../services/role-service.js";
import {ZipArchive} from "../archive/zip-archive.js";
import EntityMapper from "../domain-entities/entity-mapper.js";
import RpgToolsServer from "../server/rpgtools-server.js";
import {ChunkRepository} from "../dal/repository/chunk-repository.js";
import {FileRepository} from "../dal/repository/file-repository.js";
import {GameRepository} from "../dal/repository/game-repository.js";
import {ImageRepository} from "../dal/repository/image-repository.js";
import {ItemRepository} from "../dal/repository/item-repository.js";
import {ModelRepository} from "../dal/repository/model-repository.js";
import {MonsterRepository} from "../dal/repository/monster-repository.js";
import {PersonRepository} from "../dal/repository/person-repository.js";
import {PinRepository} from "../dal/repository/pin-repository.js";
import {PlaceRepository} from "../dal/repository/place-repository.js";
import {RoleRepository} from "../dal/repository/role-repository.js";
import {ServerConfigRepository} from "../dal/repository/server-config-repository.js";
import {UserRepository} from "../dal/repository/user-repository.js";
import {WikiFolderRepository} from "../dal/repository/wiki-folder-repository.js";
import {WikiPageRepository} from "../dal/repository/wiki-page-repository.js";
import {WorldRepository} from "../dal/repository/world-repository.js";
import {ArticleRepository} from "../dal/repository/article-repository.js";
import PostgresDbEngine from "../dal/sql/postgres-db-engine.js";
import ArticleFactory from "../domain-entities/factory/article-factory.js";
import ChunkFactory from "../domain-entities/factory/chunk-factory.js";
import FileFactory from "../domain-entities/factory/file-factory.js";
import GameFactory from "../domain-entities/factory/game-factory.js";
import ImageFactory from "../domain-entities/factory/image-factory.js";
import ItemFactory from "../domain-entities/factory/item-factory.js";
import ModelFactory from "../domain-entities/factory/model-factory.js";
import MonsterFactory from "../domain-entities/factory/monster-factory.js";
import PersonFactory from "../domain-entities/factory/person-factory.js";
import PinFactory from "../domain-entities/factory/pin-factory.js";
import PlaceFactory from "../domain-entities/factory/place-factory.js";
import RoleFactory from "../domain-entities/factory/role-factory.js";
import ServerConfigFactory from "../domain-entities/factory/server-config-factory.js";
import UserFactory from "../domain-entities/factory/user-factory.js";
import WikiFolderFactory from "../domain-entities/factory/wiki-folder-factory.js";
import WorldFactory from "../domain-entities/factory/world-factory.js";
import AclFactory from "../domain-entities/factory/acl-factory.js";
import WikiPageFactory from "../domain-entities/factory/wiki-page-factory.js";
import CharacterFactory from "../domain-entities/factory/game/character-factory.js";
import CharacterAttributeFactory from "../domain-entities/factory/game/character-attribute-factory.js";
import PathNodeFactory from "../domain-entities/factory/game/path-node-factory.js";
import StrokeFactory from "../domain-entities/factory/game/stroke-factory.js";
import FogStrokeFactory from "../domain-entities/factory/game/fog-stroke-factory.js";
import MessageFactory from "../domain-entities/factory/game/message-factory.js";
import InGameModelFactory from "../domain-entities/factory/game/in-game-model-factory.js";
import InMemoryDbEngine from "../dal/in-memory/in-memory-db-engine.js";
import SqliteDbEngine from "../dal/sql/sqlite-db-engine.js";
import AbstractSqlDbEngine from "../dal/sql/abstract-sql-db-engine.js";
import {EventWiki} from "../domain-entities/event-wiki.js";
import EventWikiFactory from "../domain-entities/factory/event-wiki-factory.js";
import DayOfTheWeekFactory from "../domain-entities/factory/calendar/day-of-the-week-factory.js";
import MonthFactory from "../domain-entities/factory/calendar/month-factory.js";
import AgeFactory from "../domain-entities/factory/calendar/age-factory.js";
import CalendarFactory from "../domain-entities/factory/calendar-factory.js";
import CalendarDataLoader from "../dal/dataloaders/calendar-data-loader.js";
import Calendar from "../domain-entities/calendar.js";
import CalendarAuthorizationPolicy from "../security/policy/calendar-authorization-policy.js";
import {EventWikiDataLoader} from "../dal/dataloaders/EventWikiDataLoader.js";
import FogStrokeAuthorization from "../security/policy/fog-stroke-authorization-policy.js";
import StrokeAuthorizationPolicy from "../security/policy/stroke-authorization-policy.js";
import EventWikiRepository from "../dal/repository/event-wiki-repository.js";
import InMemoryEventWikiRepository from "../dal/in-memory/repositories/in-memory-event-wiki-repository.js";
import {CalendarRepository} from "../dal/repository/calendar-repository.js";
import InMemoryCalendarRepository from "../dal/in-memory/repositories/in-memory-calendar-repository.js";
import FogStrokeRepository from "../dal/repository/fog-stroke-repository.js";
import InMemoryFogStrokeRepository from "../dal/in-memory/repositories/in-memory-fog-stroke-repository.js";
import StrokeRepository from "../dal/repository/stroke-repository.js";
import InMemoryStrokeRepository from "../dal/in-memory/repositories/in-memory-stroke-repository.js";
import SqlPermissionControlledRepository from "../dal/sql/repository/sql-permission-controlled-repository.js";
import SqlArticleRepository from "../dal/sql/repository/sql-article-repository.js";
import SqlChunkRepository from "../dal/sql/repository/sql-chunk-repository.js";
import SqlFileRepository from "../dal/sql/repository/sql-file-repository.js";
import SqlGameRepository from "../dal/sql/repository/sql-game-repository.js";
import SqlImageRepository from "../dal/sql/repository/sql-image-repository.js";
import SqlItemRepository from "../dal/sql/repository/sql-item-repository.js";
import SqlModelRepository from "../dal/sql/repository/sql-model-repository.js";
import SqlMonsterRepository from "../dal/sql/repository/sql-monster-repository.js";
import SqlPersonRepository from "../dal/sql/repository/sql-person-repository.js";
import SqlPinRepository from "../dal/sql/repository/sql-pin-repository.js";
import SqlPlaceRepository from "../dal/sql/repository/sql-place-repository.js";
import SqlRoleRepository from "../dal/sql/repository/sql-role-repository.js";
import SqlServerConfigRepository from "../dal/sql/repository/sql-server-config-repository.js";
import SqlUserRepository from "../dal/sql/repository/sql-user-repository.js";
import SqlWikiFolderRepository from "../dal/sql/repository/sql-wiki-folder-repository.js";
import SqlWikiPageRepository from "../dal/sql/repository/sql-wiki-page-repository.js";
import SqlWorldRepository from "../dal/sql/repository/sql-world-repository.js";
import SqlCalendarRepository from "../dal/sql/repository/sql-calendar-repository.js";
import SqlEventWikiRepository from "../dal/sql/repository/sql-event-wiki-repository.js";
import SqlFogStrokeRepository from "../dal/sql/repository/sql-fog-stroke-repository.js";
import SqlStrokeRepository from "../dal/sql/repository/sql-stroke-repository.js";

const container = new Container();

const bindAll = () => {
	// domain entities
	container.bind<Article>(INJECTABLE_TYPES.Article).to(Article);
	container.bind<Chunk>(INJECTABLE_TYPES.Chunk).to(Chunk);
	container.bind<File>(INJECTABLE_TYPES.File).to(File);
	container.bind<Game>(INJECTABLE_TYPES.Game).to(Game);
	container.bind<Image>(INJECTABLE_TYPES.Image).to(Image);
	container.bind<Item>(INJECTABLE_TYPES.Item).to(Item);
	container.bind<Model>(INJECTABLE_TYPES.Model).to(Model);
	container.bind<Monster>(INJECTABLE_TYPES.Monster).to(Monster);
	container.bind<Person>(INJECTABLE_TYPES.Person).to(Person);
	container.bind<Pin>(INJECTABLE_TYPES.Pin).to(Pin);
	container.bind<Place>(INJECTABLE_TYPES.Place).to(Place);
	container.bind<Role>(INJECTABLE_TYPES.Role).to(Role);
	container.bind<ServerConfig>(INJECTABLE_TYPES.ServerConfig).to(ServerConfig);
	container.bind<User>(INJECTABLE_TYPES.User).to(User);
	container.bind<WikiFolder>(INJECTABLE_TYPES.WikiFolder).to(WikiFolder);
	container.bind<World>(INJECTABLE_TYPES.World).to(World);
	container.bind<EventWiki>(INJECTABLE_TYPES.Event).to(EventWiki);

	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Article);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Chunk);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(File);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Game);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Image);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Item);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Model);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Monster);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Person);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Pin);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Place);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Role);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(ServerConfig);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(User);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(WikiFolder);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(World);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(EventWiki);
	container.bind<DomainEntity>(INJECTABLE_TYPES.DomainEntity).to(Calendar);

// entity factories
	container.bind<AclFactory>(INJECTABLE_TYPES.AclFactory).to(AclFactory);
	container
		.bind<ArticleFactory>(INJECTABLE_TYPES.ArticleFactory)
		.to(ArticleFactory);
	container
		.bind<ChunkFactory>(INJECTABLE_TYPES.ChunkFactory)
		.to(ChunkFactory);
	container
		.bind<FileFactory>(INJECTABLE_TYPES.FileFactory)
		.to(FileFactory);
	container
		.bind<GameFactory>(INJECTABLE_TYPES.GameFactory)
		.to(GameFactory);
	container
		.bind<ImageFactory>(INJECTABLE_TYPES.ImageFactory)
		.to(ImageFactory);
	container
		.bind<ItemFactory>(INJECTABLE_TYPES.ItemFactory)
		.to(ItemFactory);
	container
		.bind<ModelFactory>(INJECTABLE_TYPES.ModelFactory)
		.to(ModelFactory);
	container
		.bind<MonsterFactory>(INJECTABLE_TYPES.MonsterFactory)
		.to(MonsterFactory);
	container
		.bind<PersonFactory>(INJECTABLE_TYPES.PersonFactory)
		.to(PersonFactory);
	container
		.bind<PinFactory>(INJECTABLE_TYPES.PinFactory)
		.to(PinFactory);
	container
		.bind<PlaceFactory>(INJECTABLE_TYPES.PlaceFactory)
		.to(PlaceFactory);
	container
		.bind<RoleFactory>(INJECTABLE_TYPES.RoleFactory)
		.to(RoleFactory);
	container
		.bind<ServerConfigFactory>(INJECTABLE_TYPES.ServerConfigFactory)
		.to(ServerConfigFactory);
	container
		.bind<UserFactory>(INJECTABLE_TYPES.UserFactory)
		.to(UserFactory);
	container
		.bind<WikiFolderFactory>(INJECTABLE_TYPES.WikiFolderFactory)
		.to(WikiFolderFactory);
	container.bind<WikiPageFactory>(INJECTABLE_TYPES.WikiPageFactory)
		.to(WikiPageFactory);
	container
		.bind<WorldFactory>(INJECTABLE_TYPES.WorldFactory)
		.to(WorldFactory);
	container
		.bind<EventWikiFactory>(INJECTABLE_TYPES.EventWikiFactory)
		.to(EventWikiFactory);

	container
		.bind<CharacterFactory>(INJECTABLE_TYPES.CharacterFactory)
		.to(CharacterFactory);
	container
		.bind<CharacterAttributeFactory>(INJECTABLE_TYPES.CharacterAttributeFactory)
		.to(CharacterAttributeFactory);
	container
		.bind<PathNodeFactory>(INJECTABLE_TYPES.PathNodeFactory)
		.to(PathNodeFactory);
	container
		.bind<StrokeFactory>(INJECTABLE_TYPES.StrokeFactory)
		.to(StrokeFactory);
	container
		.bind<FogStrokeFactory>(INJECTABLE_TYPES.FogStrokeFactory)
		.to(FogStrokeFactory);
	container
		.bind<MessageFactory>(INJECTABLE_TYPES.MessageFactory)
		.to(MessageFactory);
	container
		.bind<InGameModelFactory>(INJECTABLE_TYPES.InGameModelFactory)
		.to(InGameModelFactory);

	container.bind<CalendarFactory>(INJECTABLE_TYPES.CalendarFactory).to(CalendarFactory);
	container
		.bind<DayOfTheWeekFactory>(INJECTABLE_TYPES.DayOfTheWeekFactory)
		.to(DayOfTheWeekFactory);
	container
		.bind<MonthFactory>(INJECTABLE_TYPES.MonthFactory)
		.to(MonthFactory);
	container
		.bind<AgeFactory>(INJECTABLE_TYPES.AgeFactory)
		.to(AgeFactory);

	// db repositories
	if (process.env.POSTGRES_HOST || process.env.SQLITE_DIRECTORY_PATH) {
		container.bind<ArticleRepository>(INJECTABLE_TYPES.ArticleRepository).to(SqlArticleRepository);
		container.bind<ChunkRepository>(INJECTABLE_TYPES.ChunkRepository).to(SqlChunkRepository);
		container.bind<FileRepository>(INJECTABLE_TYPES.FileRepository).to(SqlFileRepository);
		container.bind<GameRepository>(INJECTABLE_TYPES.GameRepository).to(SqlGameRepository);
		container.bind<ImageRepository>(INJECTABLE_TYPES.ImageRepository).to(SqlImageRepository);
		container.bind<ItemRepository>(INJECTABLE_TYPES.ItemRepository).to(SqlItemRepository);
		container.bind<ModelRepository>(INJECTABLE_TYPES.ModelRepository).to(SqlModelRepository);
		container.bind<MonsterRepository>(INJECTABLE_TYPES.MonsterRepository).to(SqlMonsterRepository);
		container.bind<PersonRepository>(INJECTABLE_TYPES.PersonRepository).to(SqlPersonRepository);
		container.bind<PinRepository>(INJECTABLE_TYPES.PinRepository).to(SqlPinRepository);
		container.bind<PlaceRepository>(INJECTABLE_TYPES.PlaceRepository).to(SqlPlaceRepository);
		container.bind<RoleRepository>(INJECTABLE_TYPES.RoleRepository).to(SqlRoleRepository);
		container
			.bind<ServerConfigRepository>(INJECTABLE_TYPES.ServerConfigRepository)
			.to(SqlServerConfigRepository);
		container.bind<UserRepository>(INJECTABLE_TYPES.UserRepository).to(SqlUserRepository);
		container
			.bind<WikiFolderRepository>(INJECTABLE_TYPES.WikiFolderRepository)
			.to(SqlWikiFolderRepository);
		container
			.bind<WikiPageRepository>(INJECTABLE_TYPES.WikiPageRepository)
			.to(SqlWikiPageRepository);
		container.bind<WorldRepository>(INJECTABLE_TYPES.WorldRepository).to(SqlWorldRepository);
		container.bind<EventWikiRepository>(INJECTABLE_TYPES.EventWikiRepository).to(SqlEventWikiRepository);
		container.bind<CalendarRepository>(INJECTABLE_TYPES.CalendarRepository).to(SqlCalendarRepository);
		container.bind<FogStrokeRepository>(INJECTABLE_TYPES.FogStrokeRepository).to(SqlFogStrokeRepository);
		container.bind<StrokeRepository>(INJECTABLE_TYPES.StrokeRepository).to(SqlStrokeRepository);

	} else {
		container.bind<ArticleRepository>(INJECTABLE_TYPES.ArticleRepository).to(InMemoryArticleRepository);
		container.bind<ChunkRepository>(INJECTABLE_TYPES.ChunkRepository).to(InMemoryChunkRepository);
		container.bind<FileRepository>(INJECTABLE_TYPES.FileRepository).to(InMemoryFileRepository);
		container.bind<GameRepository>(INJECTABLE_TYPES.GameRepository).to(InMemoryGameRepository);
		container.bind<ImageRepository>(INJECTABLE_TYPES.ImageRepository).to(InMemoryImageRepository);
		container.bind<ItemRepository>(INJECTABLE_TYPES.ItemRepository).to(InMemoryItemRepository);
		container.bind<ModelRepository>(INJECTABLE_TYPES.ModelRepository).to(InMemoryModelRepository);
		container.bind<MonsterRepository>(INJECTABLE_TYPES.MonsterRepository).to(InMemoryMonsterRepository);
		container.bind<PersonRepository>(INJECTABLE_TYPES.PersonRepository).to(InMemoryPersonRepository);
		container.bind<PinRepository>(INJECTABLE_TYPES.PinRepository).to(InMemoryPinRepository);
		container.bind<PlaceRepository>(INJECTABLE_TYPES.PlaceRepository).to(InMemoryPlaceRepository);
		container.bind<RoleRepository>(INJECTABLE_TYPES.RoleRepository).to(InMemoryRoleRepository);
		container
			.bind<ServerConfigRepository>(INJECTABLE_TYPES.ServerConfigRepository)
			.to(InMemoryServerConfigRepository);
		container.bind<UserRepository>(INJECTABLE_TYPES.UserRepository).to(InMemoryUserRepository);
		container
			.bind<WikiFolderRepository>(INJECTABLE_TYPES.WikiFolderRepository)
			.to(InMemoryWikiFolderRepository);
		container
			.bind<WikiPageRepository>(INJECTABLE_TYPES.WikiPageRepository)
			.to(InMemoryWikiPageRepository);
		container.bind<WorldRepository>(INJECTABLE_TYPES.WorldRepository).to(InMemoryWorldRepository);
		container.bind<EventWikiRepository>(INJECTABLE_TYPES.EventWikiRepository).to(InMemoryEventWikiRepository);
		container.bind<CalendarRepository>(INJECTABLE_TYPES.CalendarRepository).to(InMemoryCalendarRepository);
		container.bind<FogStrokeRepository>(INJECTABLE_TYPES.FogStrokeRepository).to(InMemoryFogStrokeRepository)
		container.bind<StrokeRepository>(INJECTABLE_TYPES.StrokeRepository).to(InMemoryStrokeRepository)
	}

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
	container
		.bind<CalendarAuthorizationPolicy>(INJECTABLE_TYPES.CalendarAuthorizationPolicy)
		.to(CalendarAuthorizationPolicy);
	container
		.bind<FogStrokeAuthorization>(INJECTABLE_TYPES.FogStrokeAuthorizationPolicy)
		.to(FogStrokeAuthorization);
	container
		.bind<StrokeAuthorizationPolicy>(INJECTABLE_TYPES.StrokeAuthorizationPolicy)
		.to(StrokeAuthorizationPolicy);

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
	container
		.bind<EventWikiRepository>(INJECTABLE_TYPES.ArchiveEventWikiRepository)
		.to(InMemoryEventWikiRepository);
	container
		.bind<CalendarRepository>(INJECTABLE_TYPES.ArchiveCalendarRepository)
		.to(InMemoryCalendarRepository);
	container
		.bind<FogStrokeRepository>(INJECTABLE_TYPES.ArchiveFogStrokeRepository)
		.to(InMemoryFogStrokeRepository);
	container
		.bind<StrokeRepository>(INJECTABLE_TYPES.ArchiveStrokeRepository)
		.to(InMemoryStrokeRepository);

// sql helpers
	container.bind<SqlPermissionControlledRepository>(INJECTABLE_TYPES.SqlPermissionControlledRepository).to(SqlPermissionControlledRepository);

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
	container.bind<UserService>(INJECTABLE_TYPES.UserService).to(UserService);
	container
		.bind<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService)
		.to(WikiFolderService);
	container.bind<WikiPageService>(INJECTABLE_TYPES.WikiPageService).to(WikiPageService);
	container.bind<WorldService>(INJECTABLE_TYPES.WorldService).to(WorldService);
	container.bind<RoleService>(INJECTABLE_TYPES.RoleService).to(RoleService);

// request contexts
	container
		.bind<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory)
		.to(ExpressSessionContextFactory);
	container
		.bind<SecurityContextFactory>(INJECTABLE_TYPES.SecurityContextFactory)
		.to(SecurityContextFactory);

// cache
	if(process.env.REDIS_URL)
		container.bind<Cache>(INJECTABLE_TYPES.Cache).to(RedisClient).inSingletonScope();
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
	container.bind<RpgToolsServer>(INJECTABLE_TYPES.RpgToolsServer).to(RpgToolsServer).inSingletonScope();
	if (process.env.POSTGRES_HOST) {
		container.bind<DbEngine>(INJECTABLE_TYPES.DbEngine).to(PostgresDbEngine).inSingletonScope();
	} else if (process.env.SQLITE_DIRECTORY_PATH) {
		container.bind<DbEngine>(INJECTABLE_TYPES.DbEngine).to(SqliteDbEngine).inSingletonScope();
	} else {
		container.bind<DbEngine>(INJECTABLE_TYPES.DbEngine).to(InMemoryDbEngine).inSingletonScope();
	}

// data loaders
	container.bind<DataLoader<Article>>(INJECTABLE_TYPES.ArticleDataLoader).to(ArticleDataLoader);
	container.bind<DataLoader<Chunk>>(INJECTABLE_TYPES.ChunkDataLoader).to(ChunkDataLoader);
	container.bind<DataLoader<File>>(INJECTABLE_TYPES.FileDataLoader).to(FileDataLoader);
	container.bind<DataLoader<Game>>(INJECTABLE_TYPES.GameDataLoader).to(GameDataLoader);
	container.bind<DataLoader<Image>>(INJECTABLE_TYPES.ImageDataLoader).to(ImageDataLoader);
	container.bind<DataLoader<Item>>(INJECTABLE_TYPES.ItemDataLoader).to(ItemDataLoader);
	container.bind<DataLoader<Model>>(INJECTABLE_TYPES.ModelDataLoader).to(ModelDataLoader);
	container.bind<DataLoader<Monster>>(INJECTABLE_TYPES.MonsterDataLoader).to(MonsterDataLoader);
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
	container.bind<DataLoader<Calendar>>(INJECTABLE_TYPES.CalendarDataLoader).to(CalendarDataLoader);
	container.bind<DataLoader<EventWiki>>(INJECTABLE_TYPES.EventDataLoader).to(EventWikiDataLoader);

// seeders
	container.bind<RoleSeeder>(INJECTABLE_TYPES.RoleSeeder).to(RoleSeeder);
	container.bind<ServerConfigSeeder>(INJECTABLE_TYPES.ServerConfigSeeder).to(ServerConfigSeeder);

// mappers
	container.bind<EntityMapper>(INJECTABLE_TYPES.EntityMapper).to(EntityMapper);

// sql
	container.bind<AbstractSqlDbEngine>(INJECTABLE_TYPES.SqlDbEngine).to(AbstractSqlDbEngine);
}


export { container, bindAll };
