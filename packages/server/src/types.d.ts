import {Document} from "mongoose";
import {User} from "./domain-entities/user";
import {SecurityContext} from "./security/security-context";
import {Role} from "./domain-entities/role";
import {Readable, Writable} from "stream";
import {GraphQLRequest, GraphQLResponse} from "apollo-server-types"
import {DocumentNode} from "graphql";
import {AclEntryDocument} from "./dal/mongodb/models/acl-entry";
import {Repository} from "./dal/repository/repository";
import {ChunkRepository} from "./dal/repository/chunk-repository";
import {FileRepository} from "./dal/repository/file-repository";
import {GameRepository} from "./dal/repository/game-repository";
import {ImageRepository} from "./dal/repository/image-repository";
import {ItemRepository} from "./dal/repository/item-repository";
import {ModelRepository} from "./dal/repository/model-repository";
import {MonsterRepository} from "./dal/repository/monster-repository";
import {PersonRepository} from "./dal/repository/person-repository";
import {PinRepository} from "./dal/repository/pin-repository";
import {PlaceRepository} from "./dal/repository/place-repository";
import {RoleRepository} from "./dal/repository/role-repository";
import {ServerConfigRepository} from "./dal/repository/server-config-repository";
import {UserRepository} from "./dal/repository/user-repository";
import {WikiFolderRepository} from "./dal/repository/wiki-folder-repository";
import {WikiPageRepository} from "./dal/repository/wiki-page-repository";
import {WorldRepository} from "./dal/repository/world-repository";
import {ArticleRepository} from "./dal/repository/article-repository";
import {DatabaseContext} from "./dal/database-context";
import {DatabaseSession} from "./dal/database-session";
import {Model} from "sequelize";
import SqlModel from "./dal/sql/models/sql-model";
import {ObjectId} from "mongoose";
import {CalendarRepository} from "./dal/repository/calendar-repository";
import EventWikiRepository from "./dal/repository/event-wiki-repository";
import FogStrokeRepository from "./dal/repository/fog-stroke-repository";
import StrokeRepository from "./dal/repository/stroke-repository";

export interface DomainEntity {
	_id: string;
	type: string;
	authorizationPolicy: EntityAuthorizationPolicy<this>;
	factory: EntityFactory<DomainEntity, MongoDBDocument, SqlModel>;

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

export interface EntityFactory<T, D extends MongoDBDocument | MongoDBDocument[], M extends Model> {
	build(args: any): T;
	fromMongodbDocument(doc: D): T;
	fromSqlModel(model?: M): Promise<T>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DatabaseEntity {}

export interface MongoDBDocument extends DatabaseEntity, Document {
	_id: string | ObjectId;
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
	seed: () => Promise<void>;
}

export interface EntityAuthorizationPolicy<Type extends DomainEntity> {
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

export type Factory<T> = (args: any) => T;

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

	createDatabaseSession(): Promise<DatabaseSession>;
}

export interface PermissionControlledDocument {
	acl: AclEntryDocument[];
}

export interface WikiPageDocument extends MongoDBDocument, PermissionControlledDocument {
	type: string;
	name: string;
	world: string;
	coverImage?: string;
	contentId?: string;
	relatedWikis: string[];
}

export interface ModeledWikiDocument extends WikiPageDocument {
	pageModel: string;
	modelColor: string;
}
