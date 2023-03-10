import {DatabaseContext} from "../dal/database-context";

export const INJECTABLE_TYPES = {

	DomainEntity: Symbol.for("DomainEntity"),

	// domain entities
	Article: Symbol.for("Article"),
	Chunk: Symbol.for("Chunk"),
	File: Symbol.for("File"),
	Game: Symbol.for("Game"),
	Image: Symbol.for("Image"),
	Item: Symbol.for("Item"),
	Model: Symbol.for("Model"),
	Monster: Symbol.for("Monster"),
	PermissionAssignment: Symbol.for("PermissionAssignment"),
	Person: Symbol.for("Person"),
	Pin: Symbol.for("Pin"),
	Place: Symbol.for("Place"),
	Role: Symbol.for("Role"),
	ServerConfig: Symbol.for("ServerConfig"),
	User: Symbol.for("User"),
	WikiFolder: Symbol.for("WikiFolder"),
	World: Symbol.for("World"),
	Event: Symbol.for("Event"),
	Calendar: Symbol.for("Calendar"),

	// entity factories
	ArticleFactory: Symbol.for("ArticleFactory"),
	AclFactory: Symbol.for('AclFactory'),
	ChunkFactory: Symbol.for("ChunkFactory"),
	FileFactory: Symbol.for("FileFactory"),
	GameFactory: Symbol.for("GameFactory"),
	ImageFactory: Symbol.for("ImageFactory"),
	ItemFactory: Symbol.for("ItemFactory"),
	ModelFactory: Symbol.for("ModelFactory"),
	MonsterFactory: Symbol.for("MonsterFactory"),
	PersonFactory: Symbol.for("PersonFactory"),
	PinFactory: Symbol.for("PinFactory"),
	PlaceFactory: Symbol.for("PlaceFactory"),
	RoleFactory: Symbol.for("RoleFactory"),
	ServerConfigFactory: Symbol.for("ServerConfigFactory"),
	UserFactory: Symbol.for("UserFactory"),
	WikiFolderFactory: Symbol.for("WikiFolderFactory"),
	WikiPageFactory: Symbol.for("WikiPageFactory"),
	WorldFactory: Symbol.for("WorldFactory"),
	EventWikiFactory: Symbol.for("EventFactory"),
	CalendarFactory: Symbol.for("CalendarFactory"),

	CharacterFactory: Symbol.for('CharacterFactory'),
	CharacterAttributeFactory: Symbol.for('CharacterAttributeFactory'),
	PathNodeFactory: Symbol.for('NodePathFactory'),
	StrokeFactory: Symbol.for('StrokeFactory'),
	FogStrokeFactory: Symbol.for('FogStrokeFactory'),
	MessageFactory: Symbol.for('MessageFactory'),
	InGameModelFactory: Symbol.for('InGameModelFactory'),

	AgeFactory: Symbol.for("AgeFactory"),
	MonthFactory: Symbol.for("MonthFactory"),
	DayOfTheWeekFactory: Symbol.for("DayOfTheWeekFactory"),

	// repositories
	ArticleRepository: Symbol.for("ArticleRepository"),
	ChunkRepository: Symbol.for("ChunkRepository"),
	FileRepository: Symbol.for("FileRepository"),
	GameRepository: Symbol.for("GameRepository"),
	ImageRepository: Symbol.for("ImageRepository"),
	ItemRepository: Symbol.for("ItemRepository"),
	ModelRepository: Symbol.for("ModelRepository"),
	MonsterRepository: Symbol.for("MonsterRepository"),
	PersonRepository: Symbol.for("PersonRepository"),
	PinRepository: Symbol.for("PinRepository"),
	PlaceRepository: Symbol.for("PlaceRepository"),
	RoleRepository: Symbol.for("RoleRepository"),
	ServerConfigRepository: Symbol.for("ServerConfigRepository"),
	UserRepository: Symbol.for("UserRepository"),
	WikiFolderRepository: Symbol.for("WikiFolderRepository"),
	WikiPageRepository: Symbol.for("WikiPageRepository"),
	WorldRepository: Symbol.for("WorldRepository"),
	EventWikiRepository: Symbol.for("EventWikiRepository"),
	CalendarRepository: Symbol.for("CalendarRepository"),
	StrokeRepository: Symbol.for('StrokeRepository'),
	FogStrokeRepository: Symbol.for('FogStrokeRepository'),

	SqlPermissionControlledRepository: Symbol.for('SqlPermissionControlledRepository'),

	// authorization policies
	ArticleAuthorizationPolicy: Symbol.for("ArticleAuthorizationPolicy"),
	ChunkAuthorizationPolicy: Symbol.for("ChunkAuthorizationPolicy"),
	FileAuthorizationPolicy: Symbol.for("FileAuthorizationPolicy"),
	GameAuthorizationPolicy: Symbol.for("GameAuthorizationPolicy"),
	ImageAuthorizationPolicy: Symbol.for("ImageAuthorizationPolicy"),
	ItemAuthorizationPolicy: Symbol.for("ItemAuthorizationPolicy"),
	ModelAuthorizationPolicy: Symbol.for("ModelAuthorizationPolicy"),
	MonsterAuthorizationPolicy: Symbol.for("MonsterAuthorizationPolicy"),
	PersonAuthorizationPolicy: Symbol.for("PersonAuthorizationPolicy"),
	PinAuthorizationPolicy: Symbol.for("PinAuthorizationPolicy"),
	PlaceAuthorizationPolicy: Symbol.for("PlaceAuthorizationPolicy"),
	RoleAuthorizationPolicy: Symbol.for("RoleAuthorizationPolicy"),
	ServerConfigAuthorizationPolicy: Symbol.for("ServerConfigAuthorizationPolicy"),
	UserAuthorizationPolicy: Symbol.for("UserAuthorizationPolicy"),
	WikiFolderAuthorizationPolicy: Symbol.for("WikiFolderAuthorizationPolicy"),
	WikiPageAuthorizationPolicy: Symbol.for("WikiPageAuthorizationPolicy"),
	WorldAuthorizationPolicy: Symbol.for("WorldAuthorizationPolicy"),
	CalendarAuthorizationPolicy: Symbol.for("CalendarAuthorizationPolicy"),
	FogStrokeAuthorizationPolicy: Symbol.for('FogStrokeAuthorizationPolicy'),
	StrokeAuthorizationPolicy: Symbol.for('StrokeAuthorizationPolicy'),

	// archive repositories
	ArchiveArticleRepository: Symbol.for("ArchiveArticleRepository"),
	ArchiveChunkRepository: Symbol.for("ArchiveChunkRepository"),
	ArchiveGameRepository: Symbol.for("ArchiveGameRepository"),
	ArchiveImageRepository: Symbol.for("ArchiveImageRepository"),
	ArchiveItemRepository: Symbol.for("ArchiveItemRepository"),
	ArchiveModelRepository: Symbol.for("ArchiveModelRepository"),
	ArchiveMonsterRepository: Symbol.for("ArchiveMonsterRepository"),
	ArchivePermissionAssignmentRepository: Symbol.for("ArchivePermissionAssignmentRepository"),
	ArchivePersonRepository: Symbol.for("ArchivePersonRepository"),
	ArchivePinRepository: Symbol.for("ArchivePinRepository"),
	ArchivePlaceRepository: Symbol.for("ArchivePlaceRepository"),
	ArchiveRoleRepository: Symbol.for("ArchiveRoleRepository"),
	ArchiveServerConfigRepository: Symbol.for("ArchiveServerConfigRepository"),
	ArchiveUserRepository: Symbol.for("ArchiveUserRepository"),
	ArchiveWikiFolderRepository: Symbol.for("ArchiveWikiFolderRepository"),
	ArchiveWikiPageRepository: Symbol.for("ArchiveWikiPageRepository"),
	ArchiveWorldRepository: Symbol.for("ArchiveWorldRepository"),
	ArchiveFileRepository: Symbol.for("ArchiveFileRepository"),

	// services
	AuthenticationService: Symbol.for("AuthenticationService"),
	AuthorizationService: Symbol.for("AuthorizationService"),
	ContentExportService: Symbol.for("ContentExportService"),
	ContentImportService: Symbol.for("ContentImportService"),
	GameService: Symbol.for("GameService"),
	ImageService: Symbol.for("ImageService"),
	ModelService: Symbol.for("ModelService"),
	RoleService: Symbol.for("RoleService"),
	ServerConfigService: Symbol.for("ServerConfigService"),
	SrdImportService: Symbol.for("SrdImportService"),
	UserService: Symbol.for("UserService"),
	WikiFolderService: Symbol.for("WikiFolderService"),
	WikiPageService: Symbol.for("WikiPageService"),
	WorldService: Symbol.for("WorldService"),

	// session contexts
	SessionContextFactory: Symbol.for("SessionContextFactory"),
	SecurityContextFactory: Symbol.for("SecurityContextFactory"),

	// 5e
	Open5eApiClient: Symbol.for("Open5eApiClient"),
	Dnd5eApiClient: Symbol.for("Dnd5eApiClient"),

	// delta
	DeltaFactory: Symbol.for("DeltaFactory"),

	// cache
	Cache: Symbol.for("Cache"),

	// archive
	ArchiveFactory: Symbol.for("ArchiveFactory"),

	ZipArchiveFactory: Symbol.for("ZipArchiveFactory"),
	ZipArchive: Symbol.for('ZipArchive'),

	// event publisher
	EventPublisher: Symbol.for("EventPublisher"),

	// server
	ApiServer: Symbol.for("ApiServer"),
	ServerProperties: Symbol.for("ServerProperties"),
	RpgToolsServer: Symbol.for('RpgToolsServer'),
	DbEngine: Symbol.for("DbEngine"),
	SqlDbEngine: Symbol.for('SqlDbEngine'),

	// data loaders
	ArticleDataLoader: Symbol.for("ArticleDataLoader"),
	ChunkDataLoader: Symbol.for("ChunkDataLoader"),
	FileDataLoader: Symbol.for("FileDataLoader"),
	GameDataLoader: Symbol.for("GameDataLoader"),
	ImageDataLoader: Symbol.for("ImageDataLoader"),
	ItemDataLoader: Symbol.for("ItemDataLoader"),
	ModelDataLoader: Symbol.for("ModelDataLoader"),
	MonsterDataLoader: Symbol.for("MonsterDataLoader"),
	PermissionAssignmentDataLoader: Symbol.for("PermissionAssignmentDataLoader"),
	PersonDataLoader: Symbol.for("PersonDataLoader"),
	PinDataLoader: Symbol.for("PinDataLoader"),
	PlaceDataLoader: Symbol.for("PlaceDataLoader"),
	RoleDataLoader: Symbol.for("RoleDataLoader"),
	ServerConfigDataLoader: Symbol.for("ServerConfigDataLoader"),
	UserDataLoader: Symbol.for("UserDataLoader"),
	WikiFolderDataLoader: Symbol.for("WikiFolderDataLoader"),
	WikiPageDataLoader: Symbol.for("WikiPageDataLoader"),
	WorldDataLoader: Symbol.for("WorldDataLoader"),
	CalendarDataLoader: Symbol.for('CalendarDataLoader'),
	EventDataLoader: Symbol.for('EventDataLoader'),

	// seeders
	RoleSeeder: Symbol.for("RoleSeeder"),
	ServerConfigSeeder: Symbol.for("ServerConfigSeeder"),

	// database context
	DatabaseContext: Symbol.for("DatabaseContext"),
	DatabaseContextFactory: Symbol.for("DatabaseContextFactory"),

	// repo mapper
	EntityMapper: Symbol.for("EntityMapper"),

	// mongodb
	FilterFactory: Symbol.for("FilterFactory"),
	MongoDbMigrationV40: Symbol.for("MongoDbMigrationV40"),


};
