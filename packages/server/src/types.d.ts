import {Document, Schema} from "mongoose";
import {User} from "./domain-entities/user";
import {SecurityContext} from "./security/security-context";
import {Article} from "./domain-entities/article";
import {Chunk} from "./domain-entities/chunk";
import {Character, FogStroke, Game, InGameModel, Message, Stroke,} from "./domain-entities/game";
import {Image} from "./domain-entities/image";
import {Item} from "./domain-entities/item";
import {Model} from "./domain-entities/model";
import {Monster} from "./domain-entities/monster";
import {Person} from "./domain-entities/person";
import {Pin} from "./domain-entities/pin";
import {Place} from "./domain-entities/place";
import {Role} from "./domain-entities/role";
import {ServerConfig} from "./domain-entities/server-config";
import {WikiFolder} from "./domain-entities/wiki-folder";
import {World} from "./domain-entities/world";
import {File} from "./domain-entities/file";
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

export interface DomainEntity {
	_id: string;
	type: string;
	authorizationPolicy: EntityAuthorizationPolicy<this>;
	factory: Factory<DomainEntity>;

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

export type ArticleFactory = (
	{
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
		contentId: string,
		acl: AclEntry[]
	}
) => Article;
export type ChunkFactory = (
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
) => Chunk;
export type FileFactory = (
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
) => File;
export type GameFactory = (
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
		host: string,
		acl: AclEntry[]
	}
) => Game;
export type ImageFactory = (
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
) => Image;
export type ItemFactory = (
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
		modelColor: string,
		acl: AclEntry[]
	}
) => Item;
export type ModelFactory = (
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
		notes: string,
		acl: AclEntry[]
	}
) => Model;
export type MonsterFactory = (
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
		modelColor: string,
		acl: AclEntry[]
	}
) => Monster;
export type PersonFactory = (
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
		modelColor: string,
		acl: AclEntry[]
	}
) => Person;
export type PinFactory = ({_id, x, y, map, page}: {_id: string, x: number, y: number, map: string, page: string}) => Pin;
export type PlaceFactory = (
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
		pixelsPerFoot: number,
		acl: AclEntry[]
	}
) => Place;
export type RoleFactory = (
	{
		_id,
		name,
		world,
		acl
	}:{
		_id: string,
		name: string,
		world: string,
		acl: AclEntry[]
	}
) => Role;
export type ServerConfigFactory = (
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
		unlockCode: string,
		acl: AclEntry[]
	}
) => ServerConfig;
export type UserFactory = (
	{
		_id,
		email,
		username,
		password,
		tokenVersion,
		currentWorld,
		roles,
	}:{
		_id: string,
		email: string,
		username: string,
		password: string,
		tokenVersion: string,
		currentWorld: string,
		roles: string[]
	}
) => User;
export type WikiFolderFactory = (
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
		children: string[],
		acl: AclEntry[]
	}
) => WikiFolder;
export type WorldFactory = (
	{
		_id,
		name,
		wikiPage,
		rootFolder,
	}:{
		_id: string,
		name: string,
		wikiPage: string,
		rootFolder: string,
		acl: AclEntry[]
	}
) => World;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DatabaseEntity {}

export interface MongoDBDocument extends DatabaseEntity, Document {
	_id: Schema.Types.ObjectId;
}

export interface DomainEntityFactory<
	DBType extends Document,
	DomainType extends DomainEntity
> {
	build: (entity: DBType) => DomainType;
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
	setDbName: (name: string) => void;

	createDatabaseSession(): Promise<DatabaseSession>;
}

export interface PermissionControlledDocument {
	acl: AclEntryDocument[];
}

export interface WikiPageDocument extends MongoDBDocument, PermissionControlledDocument {
	type: string;
	name: string;
	world: Schema.Types.ObjectId;
	coverImage?: Schema.Types.ObjectId;
	contentId?: Schema.Types.ObjectId;
}

export interface ModeledWikiDocument extends WikiPageDocument {
	pageModel: Schema.Types.ObjectId;
	modelColor: string;
}
