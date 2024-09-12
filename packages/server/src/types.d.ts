import {SecurityContext} from "./security/security-context.js";
import {Readable, Writable} from "stream";
import {GraphQLRequest, GraphQLResponse} from "apollo-server-types"
import {DocumentNode} from "graphql";
import {Repository} from "./dal/repository/repository.js";
import {ChunkRepository} from "./dal/repository/chunk-repository.js";
import {FileRepository} from "./dal/repository/file-repository.js";
import {GameRepository} from "./dal/repository/game-repository.js";
import {ImageRepository} from "./dal/repository/image-repository.js";
import {ItemRepository} from "./dal/repository/item-repository.js";
import {ModelRepository} from "./dal/repository/model-repository.js";
import {MonsterRepository} from "./dal/repository/monster-repository.js";
import {PersonRepository} from "./dal/repository/person-repository.js";
import {PinRepository} from "./dal/repository/pin-repository.js";
import {PlaceRepository} from "./dal/repository/place-repository.js";
import {RoleRepository} from "./dal/repository/role-repository.js";
import {ServerConfigRepository} from "./dal/repository/server-config-repository.js";
import {UserRepository} from "./dal/repository/user-repository.js";
import {WikiFolderRepository} from "./dal/repository/wiki-folder-repository.js";
import {WikiPageRepository} from "./dal/repository/wiki-page-repository.js";
import {WorldRepository} from "./dal/repository/world-repository.js";
import {ArticleRepository} from "./dal/repository/article-repository.js";
import {DatabaseContext} from "./dal/database-context.js";
import {Model} from "sequelize";
import SqlModel from "./dal/sql/models/sql-model.js";
import {CalendarRepository} from "./dal/repository/calendar-repository.js";
import EventWikiRepository from "./dal/repository/event-wiki-repository.js";
import FogStrokeRepository from "./dal/repository/fog-stroke-repository.js";
import StrokeRepository from "./dal/repository/stroke-repository.js";

export interface DomainEntity {
	_id: string;
	type: string;
	authorizationPolicy: EntityAuthorizationPolicy;
	factory: EntityFactory<DomainEntity, SqlModel>;

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity>;
}

export interface AclEntry {
	permission: string;
	principal: string;
	principalType: 'User' | 'Role';
}

export interface PermissionControlledEntity extends DomainEntity{
	acl: AclEntry[]
}

export interface EntityFactory<T, M extends Model> {
	build(args: any): T;
	fromSqlModel(model?: M): Promise<T>;
}

export interface CookieManager {
	setCookie: (cookie: string, value: string, age: number) => void;
	clearCookie: (cookie: string) => void;
}

export interface SessionContext {
	cookieManager: CookieManager;
	databaseContext: DatabaseContext;
	securityContext: SecurityContext;
}

export interface SessionContextFactory {
	create: (accessToken: string, refreshToken: string, cookieManager: CookieManager) => Promise<SessionContext>;
}

export interface Seeder {
	seed: (databaseContext: DatabaseContext) => Promise<void>;
}

export interface EntityAuthorizationPolicy {
	canRead: (context: SecurityContext, databaseContext: DatabaseContext) => Promise<boolean>;
	canWrite: (context: SecurityContext, databaseContext: DatabaseContext) => Promise<boolean>;
	canAdmin: (context: SecurityContext, databaseContext: DatabaseContext) => Promise<boolean>;
	canCreate: (context: SecurityContext, databaseContext: DatabaseContext) => Promise<boolean>;
}

export interface RepositoryAccessor {
	articleRepository: ArticleRepository;
	chunkRepository: ChunkRepository;
	gameRepository: GameRepository;
	imageRepository: ImageRepository;
	itemRepository: ItemRepository;
	modelRepository: ModelRepository;
	monsterRepository: MonsterRepository;
	personRepository: PersonRepository;
	pinRepository: PinRepository;
	placeRepository: PlaceRepository;
	roleRepository: RoleRepository;
	serverConfigRepository: ServerConfigRepository;
	userRepository: UserRepository;
	wikiFolderRepository: WikiFolderRepository;
	wikiPageRepository: WikiPageRepository;
	worldRepository: WorldRepository;
	fileRepository: FileRepository;
	eventRepository: EventWikiRepository;
	calendarRepository: CalendarRepository;
	fogStrokeRepository: FogStrokeRepository;
	strokeRepository: StrokeRepository;
}

export type Factory<T> = (args?: any) => T;

export interface Archive extends RepositoryAccessor {

	pipe: (output: Writable) => Promise<void>;
}

export interface AbstractArchiveFactory {
	createDefault: () => Archive;
	zipFromZipStream: (input: Readable) => Promise<Archive>;
}

export interface Cache {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string, timeout?: number) => Promise<void>;
	delete: (key: string) => Promise<void>;
	exists: (key: string) => Promise<boolean>;
	readStream: (key: string) => Readable;
	writeStream: (value: string, timeout: number) => Writable;
}

export interface AuthenticationTokens {
	accessToken: string;
	refreshToken: string;
}

export interface EventPublisher {
	publish: (event: string, payload: any) => Promise<void>;
	asyncIterator: (events: string[]) => AsyncIterator<any>;
}

export interface DataLoader<T extends DomainEntity> {
	getDocument: (id: string, databaseContext: DatabaseContext) => Promise<T>;
	getDocuments: (ids: string[], databaseContext: DatabaseContext) => Promise<T[]>;
	getPermissionControlledDocument: (context: SecurityContext, id: string, databaseContext: DatabaseContext) => Promise<T>;
	getPermissionControlledDocuments: (context: SecurityContext, ids: string[], databaseContext: DatabaseContext) => Promise<T[]>;
}

export interface ApiServer {
	start: () => Promise<void>;
	executeGraphQLQuery: (
		request: Omit<GraphQLRequest, 'query'> & {
			query?: string | DocumentNode;
		},
	) => Promise<GraphQLResponse>;
}

export interface DbEngine {
	connect: () => Promise<void>;
	clearDb: () => Promise<void>;
	disconnect: () => Promise<void>;
	setDbHost: (host: string) => void;
	changeDb: (name: string) => Promise<void>;

	createDatabaseContext(): Promise<DatabaseContext>;
}
