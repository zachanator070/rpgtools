import { FilterCondition } from "./dal/filter-condition";
import { Document, Schema } from "mongoose";
import { User } from "./domain-entities/user";
import { SecurityContext } from "./security-context";
import { Article } from "./domain-entities/article";
import { Chunk } from "./domain-entities/chunk";
import { Character, Game, InGameModel, PathNode } from "./domain-entities/game";
import { Image } from "./domain-entities/image";
import { Item } from "./domain-entities/item";
import { Model } from "./domain-entities/model";
import { Monster } from "./domain-entities/monster";
import { PermissionAssignment } from "./domain-entities/permission-assignment";
import { Person } from "./domain-entities/person";
import { Pin } from "./domain-entities/pin";
import { Place } from "./domain-entities/place";
import { Role } from "./domain-entities/role";
import { ServerConfig } from "./domain-entities/server-config";
import { WikiFolder } from "./domain-entities/wiki-folder";
import { WikiPage } from "./domain-entities/wiki-page";
import { World } from "./domain-entities/world";
import { File } from "./domain-entities/file";
import { Readable, Writable } from "stream";
import { FileUpload } from "graphql-upload";
import { ModeledPage } from "./domain-entities/modeled-page";
import { PaginatedResult } from "./dal/paginated-result";

export interface DomainEntity {
	_id: string;
	authorizationRuleset: EntityAuthorizationRuleset<this, DomainEntity>;
	type: string;
}

export interface Repository<Type extends DomainEntity> {
	create(entity: Type): Promise<void>;
	find(conditions: FilterCondition[]): Promise<Type[]>;
	update(entity: Type): Promise<void>;
	delete(entity: Type): Promise<void>;
	findOne(conditions: FilterCondition[]): Promise<Type>;
	findById(id: string): Promise<Type>;
	findPaginated(
		conditions: FilterCondition[],
		page: number,
		sort?: string
	): Promise<PaginatedResult<Type>>;
}

export interface ArticleRepository extends Repository<Article> {}
export interface ChunkRepository extends Repository<Chunk> {}
export interface FileRepository extends Repository<File> {}
export interface GameRepository extends Repository<Game> {}
export interface ImageRepository extends Repository<Image> {}
export interface ItemRepository extends Repository<Item> {}
export interface ModelRepository extends Repository<Model> {}
export interface MonsterRepository extends Repository<Monster> {}
export interface PermissionAssignmentRepository extends Repository<PermissionAssignment> {}
export interface PersonRepository extends Repository<Person> {}
export interface PinRepository extends Repository<Pin> {}
export interface PlaceRepository extends Repository<Place> {}
export interface RoleRepository extends Repository<Role> {}
export interface ServerConfigRepository extends Repository<ServerConfig> {}
export interface UserRepository extends Repository<User> {}
export interface WikiFolderRepository extends Repository<WikiFolder> {}
export interface WikiPageRepository extends Repository<WikiPage> {}
export interface WorldRepository extends Repository<World> {}

export interface DatabaseEntity {}

export abstract class MongoDBEntity extends Document implements DatabaseEntity {
	public _id: Schema.Types.ObjectId;
}

export interface DomainEntityFactory<
	DBType extends DatabaseEntity,
	DomainType extends DomainEntity
> {
	build(entity: DBType): DomainType;
}

export abstract class CookieManager {
	setCookie: (cookie: string, value: string, age: number) => void;
	clearCookie: (cookie: string) => void;
}

export type SessionContext = {
	cookieManager: CookieManager;
	securityContext: SecurityContext;
};

export interface SessionContextParameters {}
export interface SessionContextFactory {
	create(parameters: SessionContextParameters): Promise<SessionContext>;
}

export interface Seeder {
	seed(): Promise<void>;
}

export interface EntityAuthorizationRuleset<
	Type extends DomainEntity,
	Parent extends DomainEntity
> {
	canRead(context: SecurityContext, entity: Type): Promise<boolean>;
	canWrite(context: SecurityContext, entity: Type): Promise<boolean>;
	canAdmin(context: SecurityContext, entity: Type): Promise<boolean>;
	canCreate(context: SecurityContext, entity: Parent): Promise<boolean>;
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

	commit(): Promise<void>;
}

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

	pipe(output: Writable): Promise<void>;
}

export interface AbstractArchiveFactory {
	createDefault(): Archive;
	zipFromZipStream(input: Readable): Promise<Archive>;
}

export interface Cache {
	get(key: string): Promise<string | null>;
	set(key: string, value: string, timeout?: number): Promise<void>;
	delete(key: string): Promise<void>;
	exists(key: string): Promise<boolean>;
	readStream: (key: string) => Readable;
	writeStream: (value: string, timeout: number) => Writable;
}

export type AuthenticationTokens = {
	accessToken: string;
	refreshToken: string;
};
export interface AuthenticationService {
	createTokens(user: User, version: string, unitOfWork: UnitOfWork): Promise<AuthenticationTokens>;
	getUserFromAccessToken(accessToken: string, unitOfWork: UnitOfWork): Promise<User>;
	getUserFromRefreshToken(refreshToken: string, unitOfWork: UnitOfWork): Promise<User>;
	getRefreshTokenVersion(refreshToken: string): Promise<string>;
	registerUser(
		email: string,
		username: string,
		password: string,
		unitOfWork: UnitOfWork
	): Promise<User>;
	login(username: string, password: string, cookieManager: CookieManager): Promise<User>;
	logout(currentUser: User, cookieManager: CookieManager): Promise<string>;
	register(registerCode: string, email: string, username: string, password: string): Promise<User>;
}

export interface AuthorizationService {
	grantUserPermission(
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string
	): Promise<User>;
	revokeUserPermission(
		context: SecurityContext,
		permission: string,
		subjectId: string,
		userId: string
	): Promise<User>;
	grantRolePermission(
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string
	): Promise<Role>;
	revokeRolePermission(
		context: SecurityContext,
		roleId: string,
		permission: string,
		subjectId: string
	): Promise<Role>;
	createRole(context: SecurityContext, worldId: string, name: string): Promise<World>;
	deleteRole(context: SecurityContext, roleId: string): Promise<World>;
	cleanUpPermissions(subjectId: string, unitOfWork: UnitOfWork): Promise<void>;
	addUserRole(context: SecurityContext, userId: string, roleId: string): Promise<World>;
	removeUserRole(context: SecurityContext, userId: string, roleId: string): Promise<World>;
}

export interface ContentExportService {
	exportWikiPage(
		context: SecurityContext,
		docId: string,
		wikiType: string,
		archive: Archive
	): Promise<void>;
	exportModel(context: SecurityContext, docId: string, archive: Archive): Promise<void>;
	exportWikiFolder(
		context: SecurityContext,
		docId: string,
		archive: Archive,
		errorOut?: boolean
	): Promise<void>;
}
export interface ContentImportService {
	importContent(context: SecurityContext, folderId: string, zipFile: FileUpload): Promise<World>;
}

export interface EventPublisher {
	publish(event: string, payload: any): Promise<void>;
	asyncIterator(events: string[]): AsyncIterator<any>;
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
	getWorlds: (context: SecurityContext, page: number) => Promise<PaginatedResult<World>>;
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
	) => Promise<void>;
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
	getUsers: (context: SecurityContext, username: string) => Promise<User[]>;
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
	deleteWiki: (context: SecurityContext, wikiId: string) => Promise<string>;
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
	moveWiki: (context: SecurityContext, wikiId: string, folderId: string) => Promise<string>;
	getWiki: (context: SecurityContext, wikiId: string) => Promise<WikiPage>;
	getWikisInFolder: (
		context: SecurityContext,
		folderId: string,
		page: number
	) => Promise<PaginatedResult<WikiPage>>;
}

export interface DataLoader<T extends DomainEntity> {
	getDocument: (id: string) => Promise<T>;
	getDocuments: (ids: string[]) => Promise<T[]>;
	getPermissionControlledDocument: (context: SecurityContext, id: string) => Promise<T>;
	getPermissionControlledDocuments: (context: SecurityContext, ids: string[]) => Promise<T[]>;
}

export interface ApiServer {
	start(): Promise<void>;

	checkConfig(): Promise<void>;
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
