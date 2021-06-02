import { FilterCondition } from "./dal/filter-condition";
import { Document, Schema } from "mongoose";
import { User } from "./domain-entities/user";
import { AuthenticationService } from "./services/authentication-service";
import { AuthorizationService } from "./services/authorization-service";
import { SecurityContext } from "./security-context";
import { WikiFolderService } from "./services/wiki-folder-service";
import { Article } from "./domain-entities/article";
import { Chunk } from "./domain-entities/chunk.";
import { Game } from "./domain-entities/game";
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
import { ContentExportService } from "./services/content-export-service";
import { ContentImportService } from "./services/content-import-service";
import { GameService } from "./services/game-service";
import { ImageService } from "./services/image-service";
import { ModelService } from "./services/model-service";
import { ServerConfigService } from "./services/server-config-service";
import { SrdImportService } from "./services/srd-import-service";
import { UserService } from "./services/user-service";
import { WikiPageService } from "./services/wiki-page-service";
import { WorldService } from "./services/world-service";
import { Readable, Writable } from "stream";
import jwt from "jsonwebtoken";
import {
	ACCESS_TOKEN,
	ACCESS_TOKEN_MAX_AGE,
	REFRESH_TOKEN,
	REFRESH_TOKEN_MAX_AGE,
} from "./constants";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./resolvers/mutations/authentication-mutations";
import {
	ANON_USERNAME,
	ROLE_ADD,
	ROLE_ADMIN,
	ROLE_RW,
} from "../../common/src/permission-constants";
import { ROLE } from "../../common/src/type-constants";
import { EVERYONE, WORLD_OWNER } from "../../common/src/role-constants";

export interface DomainEntity {
	_id: string;
}

export interface Repository<Type extends DomainEntity> {
	create(entity: Type): Promise<void>;
	find(conditions: FilterCondition[]): Promise<Type[]>;
	update(entity: Type): Promise<void>;
	delete(entity: Type): Promise<void>;
	findOne(conditions: FilterCondition[]): Promise<Type>;
	findById(id: string): Promise<Type>;
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

export interface ApplicationService {}

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

export interface EntityAuthorizationRuleset<Type extends DomainEntity> {
	canRead(context: SecurityContext, entity: Type): Promise<boolean>;
	canWrite(context: SecurityContext, entity: Type): Promise<boolean>;
	canAdmin(context: SecurityContext, entity: Type): Promise<boolean>;
	canCreate(context: SecurityContext, entity: DomainEntity): Promise<boolean>;
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
	createTokens(user: User, version?: string): Promise<AuthenticationTokens>;
	getCurrentUser(userId: string): Promise<User>;
	getUserFromAccessToken(accessToken?: string): Promise<User>;
	getUserFromRefreshToken(refreshToken?: string): Promise<User>;
	getRefreshTokenVersion(refreshToken: string): Promise<string>;
	registerUser(email: string, username: string, password: string): Promise<User>;
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
	cleanUpPermissions(subjectId: string): Promise<void>;
	addUserRole(context: SecurityContext, userId: string, roleId: string): Promise<World>;
	removeUserRole(context: SecurityContext, userId: string, roleId: string): Promise<World>;
}
