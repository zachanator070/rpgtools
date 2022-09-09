import {FilterCondition} from "./dal/filter-condition";
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
import {WikiPage} from "./domain-entities/wiki-page";
import {World} from "./domain-entities/world";
import {File} from "./domain-entities/file";
import {Readable, Writable} from "stream";
import {PaginatedResult} from "./dal/paginated-result";
import {GraphQLRequest, GraphQLResponse} from "apollo-server-types"
import {DocumentNode} from "graphql";
import {AclEntryDocument} from "./dal/mongodb/models/acl-entry";

export interface DomainEntity {
	_id: string;
	type: string;
	authorizationPolicy: EntityAuthorizationPolicy<this>;
	factory: Factory<DomainEntity>;

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity>;
}

export interface AclEntry {
	permission: string;
	principal: User | Role;
	principalType: 'User' | 'Role';
}

export interface PermissionControlledEntity {
	acl: AclEntry[]
}

export interface Repository<Type extends DomainEntity> {
	create: (entity: Type) => Promise<void>;
	find: (conditions: FilterCondition[]) => Promise<Type[]>;
	update: (entity: Type) => Promise<void>;
	delete: (entity: Type) => Promise<void>;
	findOne: (conditions?: FilterCondition[]) => Promise<Type>;
	findById: (id: string) => Promise<Type>;
	findPaginated: (
		conditions: FilterCondition[],
		page: number,
		sort?: string
	) => Promise<PaginatedResult<Type>>;
}

export type ArticleRepository = Repository<Article>;
export type ChunkRepository = Repository<Chunk>;
export type FileRepository = Repository<File>;
export type GameRepository = Repository<Game>;
export type ImageRepository = Repository<Image>;
export type ItemRepository = Repository<Item>;
export type ModelRepository = Repository<Model>;
export type MonsterRepository = Repository<Monster>;
export type PersonRepository = Repository<Person>;
export type PinRepository = Repository<Pin>;
export type PlaceRepository = Repository<Place>;
export type RoleRepository = Repository<Role>;
export type ServerConfigRepository = Repository<ServerConfig>;
export type UserRepository = Repository<User>;
export type WikiFolderRepository = Repository<WikiFolder>;
export type WikiPageRepository = Repository<WikiPage>;
export type WorldRepository = Repository<World>;

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
		contentId: string
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
		host: string
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
		modelColor: string
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
		notes: string
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
		modelColor: string
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
		modelColor: string
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
		pixelsPerFoot: number
	}
) => Place;
export type RoleFactory = (
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
		unlockCode: string
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
		children: string[]
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
	unitOfWork: UnitOfWork;
	securityContext: SecurityContext;
}

export interface SessionContextFactory {
	create: (accessToken: string, refreshToken: string, cookieManager: CookieManager) => Promise<SessionContext>;
}

export interface Seeder {
	seed: () => Promise<void>;
}

export interface EntityAuthorizationPolicy<Type extends DomainEntity> {
	canRead: (context: SecurityContext, unitOfWork: UnitOfWork) => Promise<boolean>;
	canWrite: (context: SecurityContext, unitOfWork: UnitOfWork) => Promise<boolean>;
	canAdmin: (context: SecurityContext, unitOfWork: UnitOfWork) => Promise<boolean>;
	canCreate: (context: SecurityContext, unitOfWork: UnitOfWork) => Promise<boolean>;
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

export interface UnitOfWork extends RepositoryAccessor {

	commit: () => Promise<void>;
	rollback: () => Promise<void>;
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
	getDocument: (id: string, unitOfWork:UnitOfWork) => Promise<T>;
	getDocuments: (ids: string[], unitOfWork:UnitOfWork) => Promise<T[]>;
	getPermissionControlledDocument: (context: SecurityContext, id: string, unitOfWork:UnitOfWork) => Promise<T>;
	getPermissionControlledDocuments: (context: SecurityContext, ids: string[], unitOfWork:UnitOfWork) => Promise<T[]>;
}

export interface ApiServer {
	start: () => Promise<void>;
	checkConfig: () => Promise<boolean>;
	initDb: () => Promise<void>;
	setDbHost: (host: string) => void;
	setDbName: (name: string) => void;
	clearDb: () => Promise<void>;
	serverNeedsSetup: () => Promise<boolean>;
	executeGraphQLQuery: (
		request: Omit<GraphQLRequest, 'query'> & {
			query?: string | DocumentNode;
		},
	) => Promise<GraphQLResponse>;
}

export interface PermissionControlledDocument {
	acl: AclEntryDocument<any>[];
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

export interface ChunkDocument extends MongoDBDocument {
	image: Schema.Types.ObjectId;
	x: number;
	y: number;
	width: number;
	height: number;
	fileId: string;
}

export interface ItemDocument extends ModeledWikiDocument {}

export interface PersonDocument extends ModeledWikiDocument {}

export interface PlaceDocument extends WikiPageDocument {
	mapImage: Schema.Types.ObjectId;
	pixelsPerFoot: number;
}

export interface MonsterDocument extends ModeledWikiDocument {}

export interface WikiFolderDocument extends MongoDBDocument, PermissionControlledDocument {
	name: string;
	world: Schema.Types.ObjectId;
	pages: Schema.Types.ObjectId[];
	children: Schema.Types.ObjectId[];
}

export interface UserDocument extends MongoDBDocument {
	email: string;
	username: string;
	password: string;
	tokenVersion: string;
	currentWorld: Schema.Types.ObjectId;
	roles: Schema.Types.ObjectId[];
	permissions: Schema.Types.ObjectId[];
}

export interface ServerConfigDocument extends MongoDBDocument, PermissionControlledDocument {
	version: string;
	registerCodes: string[];
	adminUsers: Schema.Types.ObjectId[];
	unlockCode: string;
}

export interface RoleDocument extends MongoDBDocument, PermissionControlledDocument {
	name: string;
	world: Schema.Types.ObjectId;
	permissions: Schema.Types.ObjectId[];
}

export interface PinDocument extends MongoDBDocument {
	x: number;
	y: number;
	map: Schema.Types.ObjectId;
	page: Schema.Types.ObjectId;
}

export interface ModelDocument extends MongoDBDocument, PermissionControlledDocument {
	world: Schema.Types.ObjectId;
	name: string;
	depth: number;
	width: number;
	height: number;
	fileName: string;
	fileId: string;
	notes: string;
}

export interface ImageDocument extends MongoDBDocument {
	world: Schema.Types.ObjectId;
	width: number;
	height: number;
	chunkWidth: number;
	chunkHeight: number;
	chunks: Schema.Types.ObjectId[];
	icon: Schema.Types.ObjectId;
	name: string;
}

export interface PathNodeDocument extends MongoDBDocument {
	x: number;
	y: number;
}

export interface StrokeDocument extends MongoDBDocument {
	path: PathNodeDocument[];
	color: string;
	size: number;
	fill: boolean;
	type: string;
}

export interface FogStrokeDocument extends MongoDBDocument {
	path: PathNodeDocument[];
	size: number;
	type: string;
}

export interface GameDocument extends MongoDBDocument, PermissionControlledDocument {
	passwordHash: string;
	world: Schema.Types.ObjectId;
	map: Schema.Types.ObjectId;
	characters: CharacterDocument[];
	host: Schema.Types.ObjectId;
	strokes: StrokeDocument[];
	fog: FogStrokeDocument[];
	models: InGameModelDocument[];
	messages: MessageDocument[];
}

export interface CharacterDocument extends MongoDBDocument {
	name: string;
	player: Schema.Types.ObjectId;
	color: string;
	attributes: CharacterAttributeDocument[];
}

export interface CharacterAttributeDocument extends MongoDBDocument {
	name: string;
	value: number;
}

export interface MessageDocument extends MongoDBDocument {
	sender: string;
	senderUser: string;
	receiver: string;
	receiverUser: string;
	message: string;
	timestamp: number;
}

export interface InGameModelDocument extends MongoDBDocument {
	model: Schema.Types.ObjectId;
	x: number;
	z: number;
	lookAtX: number;
	lookAtZ: number;
	color: string;
	wiki: Schema.Types.ObjectId;
}

export interface WorldDocument extends MongoDBDocument, PermissionControlledDocument {
	name: string;
	wikiPage: Schema.Types.ObjectId;
	rootFolder: Schema.Types.ObjectId;
	pins: Schema.Types.ObjectId[];
}