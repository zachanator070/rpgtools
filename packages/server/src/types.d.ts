import {FilterCondition} from "./dal/filter-condition";
import {Document, Schema} from "mongoose";
import {User} from "./domain-entities/user";
import {SecurityContext} from "./security/security-context";
import {Article} from "./domain-entities/article";
import {Chunk} from "./domain-entities/chunk";
import {Character, FogStroke, Game, InGameModel, Message, PathNode, Stroke,} from "./domain-entities/game";
import {Image} from "./domain-entities/image";
import {Item} from "./domain-entities/item";
import {Model} from "./domain-entities/model";
import {Monster} from "./domain-entities/monster";
import {PermissionAssignment} from "./domain-entities/permission-assignment";
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
import {FileUpload, GraphQLOperation} from "graphql-upload";
import {ModeledPage} from "./domain-entities/modeled-page";
import {PaginatedResult} from "./dal/paginated-result";
import {GraphQLRequest, GraphQLResponse} from "apollo-server-types"
import {DocumentNode} from "graphql";
export interface DomainEntity {
	_id: string;
	authorizationRuleset: EntityAuthorizationRuleset<this, DomainEntity>;
	type: string;
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
export type PermissionAssignmentRepository = Repository<PermissionAssignment>;
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
	id: string,
	name: string,
	worldId: string,
	coverImageId: string,
	contentId: string
) => Article;
export type ChunkFactory = (
	id: string,
	x: number,
	y: number,
	width: number,
	height: number,
	fileId: string,
	imageId: string
) => Chunk;
export type FileFactory = (
	id: string,
	filename: string,
	readStream: Readable,
	mimeType: string
) => File;
export type GameFactory = (
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
) => Game;
export type ImageFactory = (
	id: string,
	name: string,
	worldId: string,
	width: number,
	height: number,
	chunkWidth: number,
	chunkHeight: number,
	chunkIds: string[],
	iconId: string
) => Image;
export type ItemFactory = (
	id: string,
	name: string,
	world: string,
	coverImageId: string,
	contentId: string,
	modelId: string,
	modelColor: string
) => Item;
export type ModelFactory = (
	id: string,
	worldId: string,
	name: string,
	depth: number,
	width: number,
	height: number,
	fileName: string,
	fileId: string,
	notes: string
) => Model;
export type MonsterFactory = (
	id: string,
	name: string,
	world: string,
	coverImageId: string,
	contentId: string,
	modelId: string,
	modelColor: string
) => Monster;
export type PermissionAssignmentFactory = (
	id: string,
	permission: string,
	subject: string,
	subjectType: string
) => PermissionAssignment;
export type PersonFactory = (
	id: string,
	name: string,
	world: string,
	coverImageId: string,
	contentId: string,
	modelId: string,
	modelColor: string
) => Person;
export type PinFactory = (id: string, x: number, y: number, mapId: string, pageId: string) => Pin;
export type PlaceFactory = (
	id: string,
	name: string,
	worldId: string,
	coverImageId: string,
	contentId: string,
	mapImageId: string,
	pixelsPerFoot: number
) => Place;
export type RoleFactory = (
	id: string,
	name: string,
	worldId: string,
	permissionIds: string[]
) => Role;
export type ServerConfigFactory = (
	id: string,
	version: string,
	registerCodes: string[],
	adminUserIds: string[],
	unlockCode: string
) => ServerConfig;
export type UserFactory = (
	_id: string,
	email: string,
	username: string,
	password: string,
	tokenVersion: string,
	currentWorldId: string,
	roleIds: string[],
	permissionIds: string[]
) => User;
export type WikiFolderFactory = (
	id: string,
	name: string,
	worldId: string,
	pageIds: string[],
	childrenIds: string[]
) => WikiFolder;
export type WorldFactory = (
	id: string,
	name: string,
	wikiPageId: string,
	rootFolderId: string,
	roleIds: string[],
	pinIds: string[]
) => World;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DatabaseEntity {}

export interface MongoDBEntity extends DatabaseEntity, Document {
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
	securityContext: SecurityContext;
}

export interface SessionContextFactory {
	create: (parameters: any) => Promise<SessionContext>;
}

export interface Seeder {
	seed: () => Promise<void>;
}

export interface EntityAuthorizationRuleset<
	Type extends DomainEntity,
	Parent extends DomainEntity
> {
	canRead: (context: SecurityContext, entity: Type) => Promise<boolean>;
	canWrite: (context: SecurityContext, entity: Type) => Promise<boolean>;
	canAdmin: (context: SecurityContext, entity: Type) => Promise<boolean>;
	canCreate: (context: SecurityContext, entity: Parent) => Promise<boolean>;
}

export interface UnitOfWork {
	articleRepository: ArticleRepository;
	chunkRepository: ChunkRepository;
	gameRepository: GameRepository;
	imageRepository: ImageRepository;
	itemRepository: ItemRepository;
	modelRepository: ModelRepository;
	monsterRepository: MonsterRepository;
	permissionAssignmentRepository: PermissionAssignmentRepository;
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

	commit: () => Promise<void>;
}

export type Factory<T> = () => T;

export interface Archive {
	articleRepository: ArticleRepository;
	chunkRepository: ChunkRepository;
	gameRepository: GameRepository;
	imageRepository: ImageRepository;
	itemRepository: ItemRepository;
	modelRepository: ModelRepository;
	monsterRepository: MonsterRepository;
	permissionAssignmentRepository: PermissionAssignmentRepository;
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
export interface AuthenticationService {
	createTokens: (
		user: User,
		version: string,
		unitOfWork: UnitOfWork
	) => Promise<AuthenticationTokens>;
	getUserFromAccessToken: (accessToken: string, unitOfWork: UnitOfWork) => Promise<User>;
	getUserFromRefreshToken: (refreshToken: string, unitOfWork: UnitOfWork) => Promise<User>;
	getRefreshTokenVersion: (refreshToken: string) => Promise<string>;
	registerUser: (
		email: string,
		username: string,
		password: string,
		unitOfWork: UnitOfWork
	) => Promise<User>;
	login: (username: string, password: string, cookieManager: CookieManager) => Promise<User>;
	logout: (currentUser: User, cookieManager: CookieManager) => Promise<string>;
	register: (
		registerCode: string,
		email: string,
		username: string,
		password: string
	) => Promise<User>;
}

export interface AuthorizationService {
	grantUserPermission: (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string
	) => Promise<DomainEntity>;
	revokeUserPermission: (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		userId: string
	) => Promise<DomainEntity>;
	grantRolePermission: (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		roleId: string
	) => Promise<Role>;
	revokeRolePermission: (
		context: SecurityContext,
		roleId: string,
		permission: string,
		subjectId: string
	) => Promise<Role>;
	createRole: (context: SecurityContext, worldId: string, name: string) => Promise<World>;
	deleteRole: (context: SecurityContext, roleId: string) => Promise<World>;
	cleanUpPermissions: (subjectId: string, unitOfWork: UnitOfWork) => Promise<void>;
	addUserRole: (context: SecurityContext, userId: string, roleId: string) => Promise<World>;
	removeUserRole: (context: SecurityContext, userId: string, roleId: string) => Promise<World>;
}

export interface ContentExportService {
	exportWikiPage: (
		context: SecurityContext,
		docId: string,
		wikiType: string,
		archive: Archive
	) => Promise<void>;
	exportModel: (context: SecurityContext, docId: string, archive: Archive) => Promise<void>;
	exportWikiFolder: (
		context: SecurityContext,
		docId: string,
		archive: Archive,
		errorOut?: boolean
	) => Promise<void>;
}
export interface ContentImportService {
	importContent: (
		context: SecurityContext,
		folderId: string,
		zipFile: FileUpload
	) => Promise<World>;
}

export interface EventPublisher {
	publish: (event: string, payload: any) => Promise<void>;
	asyncIterator: (events: string[]) => AsyncIterator<any>;
}
export interface ImageService {
	createImage: (
		worldId: string,
		chunkify: boolean,
		filename: string,
		readStream: Readable,
		givenUnitOfWork?: UnitOfWork
	) => Promise<Image>;
}
export interface GameService {
	createGame: (
		context: SecurityContext,
		worldId: string,
		password: string,
		characterName: string
	) => Promise<Game>;
	joinGame: (
		context: SecurityContext,
		gameId: string,
		password: string,
		characterName: string
	) => Promise<Game>;
	leaveGame: (context: SecurityContext, gameId: string) => Promise<boolean>;
	gameChat: (context: SecurityContext, gameId: string, message: string) => Promise<Game>;
	setGameMap: (
		context: SecurityContext,
		gameId: string,
		placeId: string,
		clearPaint: boolean,
		setFog: boolean
	) => Promise<Game>;
	addStroke: (
		context: SecurityContext,
		gameId: string,
		path: PathNode[],
		type: string,
		size: number,
		color: string,
		fill: boolean,
		strokeId: string
	) => Promise<Game>;
	addFogStroke: (
		context: SecurityContext,
		gameId: string,
		path: PathNode[],
		type: string,
		size: number,
		strokeId: string
	) => Promise<Game>;
	addModel: (
		context: SecurityContext,
		gameId: string,
		modelId: string,
		wikiId: string,
		color: string
	) => Promise<Game>;
	setModelPosition: (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		x: number,
		z: number,
		lookAtX: number,
		lookAtZ: number
	) => Promise<InGameModel>;
	setModelColor: (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		color: string
	) => Promise<any>;
	deletePositionedModel: (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string
	) => Promise<Game>;
	setPositionedModelWiki: (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		wikiId: string
	) => Promise<any>;
	setCharacterOrder: (
		context: SecurityContext,
		gameId: string,
		characters: Character[]
	) => Promise<Game>;
	setCharacterAttributes: (
		context: SecurityContext,
		gameId: string,
		str: number,
		dex: number,
		con: number,
		int: number,
		wis: number,
		cha: number
	) => Promise<Game>;
	getGame: (context: SecurityContext, gameId: string) => Promise<Game>;
	getMyGames: (context: SecurityContext) => Promise<Game[]>;
}
export interface WorldService {
	createWorld: (
		name: string,
		isPublic: boolean,
		securityContext: SecurityContext
	) => Promise<World>;
	renameWorld: (context: SecurityContext, worldId: string, newName: string) => Promise<World>;
	createPin: (
		context: SecurityContext,
		mapId: string,
		wikiId: string,
		x: number,
		y: number
	) => Promise<World>;
	updatePin: (context: SecurityContext, pinId: string, pageId: string) => Promise<World>;
	deletePin: (context: SecurityContext, pinId: string) => Promise<World>;
	getWorld: (context: SecurityContext, worldId: string) => Promise<World>;
	getWorlds: (context: SecurityContext, name: string, page: number) => Promise<PaginatedResult<World>>;
}

export interface ModelService {
	createModel: (
		context: SecurityContext,
		worldId: string,
		name: string,
		fileUpload: FileUpload,
		depth: number,
		width: number,
		height: number,
		notes: string
	) => Promise<Model>;
	updateModel: (
		context: SecurityContext,
		modelId: string,
		name: string,
		depth: number,
		width: number,
		height: number,
		notes: string,
		file?: FileUpload
	) => Promise<Model>;
	deleteModel: (context: SecurityContext, modelId: string) => Promise<Model>;
	getModels: (context: SecurityContext, worldId: string) => Promise<Model[]>;
}
export interface SrdImportService {
	import5eSrd: (
		context: SecurityContext,
		worldId: string,
		importCreatureCodex: boolean,
		importTomeOfBeasts: boolean
	) => Promise<World>;
}
export interface ServerConfigService {
	unlockServer: (
		unlockCode: string,
		email: string,
		username: string,
		password: string
	) => Promise<boolean>;
	generateRegisterCodes: (context: SecurityContext, amount: number) => Promise<ServerConfig>;
	getServerConfig: () => Promise<ServerConfig>;
}
export interface UserService {
	setCurrentWorld: (context: SecurityContext, worldId: string) => Promise<User>;
	getUsers: (context: SecurityContext, username: string, page: number) => Promise<PaginatedResult<User>>;
}
export interface WikiFolderService {
	createFolder: (context: SecurityContext, name: string, parentFolderId: string) => Promise<World>;
	renameFolder: (context: SecurityContext, folderId: string, name: string) => Promise<WikiFolder>;
	deleteFolder: (context: SecurityContext, folderId: string) => Promise<World>;
	moveFolder: (
		context: SecurityContext,
		folderId: string,
		parentFolderId: string
	) => Promise<World>;
	getFolders: (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean
	) => Promise<WikiFolder[]>;
	getFolderPath: (context: SecurityContext, wikiId: string) => Promise<WikiFolder[]>;
}
export interface WikiPageService {
	createWiki: (context: SecurityContext, name: string, folderId: string) => Promise<WikiFolder>;
	updateWiki: (
		context: SecurityContext,
		wikiId: string,
		readStream?: Readable,
		name?: string,
		coverImageId?: string,
		type?: string
	) => Promise<WikiPage>;
	deleteWiki: (context: SecurityContext, wikiId: string) => Promise<World>;
	updatePlace: (
		context: SecurityContext,
		placeId: string,
		pixelsPerFoot: number,
		mapImageId?: string
	) => Promise<Place>;
	updateModeledWiki: (
		context: SecurityContext,
		wikiId: string,
		model: string,
		color: string
	) => Promise<ModeledPage>;
	moveWiki: (context: SecurityContext, wikiId: string, folderId: string) => Promise<WikiPage>;
	getWiki: (context: SecurityContext, wikiId: string) => Promise<WikiPage>;
	getWikisInFolder: (
		context: SecurityContext,
		folderId: string,
		page: number
	) => Promise<PaginatedResult<WikiPage>>;
	searchWikis: (context: SecurityContext, worldId: string, name: string, types: string[], canAdmin: boolean) => Promise<PaginatedResult<WikiPage>>;
}

export interface DataLoader<T extends DomainEntity> {
	getDocument: (id: string) => Promise<T>;
	getDocuments: (ids: string[]) => Promise<T[]>;
	getPermissionControlledDocument: (context: SecurityContext, id: string) => Promise<T>;
	getPermissionControlledDocuments: (context: SecurityContext, ids: string[]) => Promise<T[]>;
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
export interface RoleService {
	getRoles: (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean,
		page: number
	) => Promise<PaginatedResult<Role>>;
}

export interface WikiPageDocument extends MongoDBEntity {
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

export interface ChunkDocument extends MongoDBEntity {
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

export interface WikiFolderDocument extends MongoDBEntity {
	name: string;
	world: Schema.Types.ObjectId;
	pages: Schema.Types.ObjectId[];
	children: Schema.Types.ObjectId[];
}

export interface UserDocument extends MongoDBEntity {
	email: string;
	username: string;
	password: string;
	tokenVersion: string;
	currentWorld: Schema.Types.ObjectId;
	roles: Schema.Types.ObjectId[];
	permissions: Schema.Types.ObjectId[];
}

export interface ServerConfigDocument extends MongoDBEntity {
	version: string;
	registerCodes: string[];
	adminUsers: Schema.Types.ObjectId[];
	unlockCode: string;
}

export interface RoleDocument extends MongoDBEntity {
	name: string;
	world: Schema.Types.ObjectId;
	permissions: Schema.Types.ObjectId[];
}

export interface PinDocument extends MongoDBEntity {
	x: number;
	y: number;
	map: Schema.Types.ObjectId;
	page: Schema.Types.ObjectId;
}

export interface PermissionAssignmentDocument extends MongoDBEntity {
	permission: string;
	subject: Schema.Types.ObjectId;
	subjectType: string;
}

export interface ModelDocument extends MongoDBEntity {
	world: Schema.Types.ObjectId;
	name: string;
	depth: number;
	width: number;
	height: number;
	fileName: string;
	fileId: string;
	notes: string;
}

export interface ImageDocument extends MongoDBEntity {
	world: Schema.Types.ObjectId;
	width: number;
	height: number;
	chunkWidth: number;
	chunkHeight: number;
	chunks: Schema.Types.ObjectId[];
	icon: Schema.Types.ObjectId;
	name: string;
}

export interface PathNodeDocument extends MongoDBEntity {
	x: number;
	y: number;
}

export interface StrokeDocument extends MongoDBEntity {
	path: PathNodeDocument[];
	color: string;
	size: number;
	fill: boolean;
	type: string;
}

export interface FogStrokeDocument extends MongoDBEntity {
	path: PathNodeDocument[];
	size: number;
	type: string;
}

export interface GameDocument extends MongoDBEntity {
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

export interface CharacterDocument extends MongoDBEntity {
	name: string;
	player: Schema.Types.ObjectId;
	color: string;
	str: number;
	dex: number;
	con: number;
	int: number;
	wis: number;
	cha: number;
}

export interface MessageDocument extends MongoDBEntity {
	sender: string;
	receiver: string;
	message: string;
	timestamp: number;
}

export interface InGameModelDocument extends MongoDBEntity {
	gameModel: Schema.Types.ObjectId;
	x: number;
	z: number;
	lookAtX: number;
	lookAtZ: number;
	color: string;
	wiki: Schema.Types.ObjectId;
}

export interface WorldDocument extends MongoDBEntity {
	name: string;
	wikiPage: Schema.Types.ObjectId;
	rootFolder: Schema.Types.ObjectId;
	roles: Schema.Types.ObjectId[];
	pins: Schema.Types.ObjectId[];
}