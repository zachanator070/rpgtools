export const INJECTABLE_TYPES = {
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

	// entity factories
	ArticleFactory: Symbol.for("ArticleFactory"),
	ChunkFactory: Symbol.for("ChunkFactory"),
	FileFactory: Symbol.for("FileFactory"),
	GameFactory: Symbol.for("GameFactory"),
	ImageFactory: Symbol.for("ImageFactory"),
	ItemFactory: Symbol.for("ItemFactory"),
	ModelFactory: Symbol.for("ModelFactory"),
	MonsterFactory: Symbol.for("MonsterFactory"),
	PermissionAssignmentFactory: Symbol.for("PermissionAssignmentFactory"),
	PersonFactory: Symbol.for("PersonFactory"),
	PinFactory: Symbol.for("PinFactory"),
	PlaceFactory: Symbol.for("PlaceFactory"),
	RoleFactory: Symbol.for("RoleFactory"),
	ServerConfigFactory: Symbol.for("ServerConfigFactory"),
	UserFactory: Symbol.for("UserFactory"),
	WikiFolderFactory: Symbol.for("WikiFolderFactory"),
	WorldFactory: Symbol.for("WorldFactory"),

	// repositories
	ArticleRepository: Symbol.for("ArticleRepository"),
	ChunkRepository: Symbol.for("ChunkRepository"),
	FileRepository: Symbol.for("FileRepository"),
	GameRepository: Symbol.for("GameRepository"),
	ImageRepository: Symbol.for("ImageRepository"),
	ItemRepository: Symbol.for("ItemRepository"),
	ModelRepository: Symbol.for("ModelRepository"),
	MonsterRepository: Symbol.for("MonsterRepository"),
	PermissionAssignmentRepository: Symbol.for("PermissionAssignmentRepository"),
	PersonRepository: Symbol.for("PersonRepository"),
	PinRepository: Symbol.for("PinRepository"),
	PlaceRepository: Symbol.for("PlaceRepository"),
	RoleRepository: Symbol.for("RoleRepository"),
	ServerConfigRepository: Symbol.for("ServerConfigRepository"),
	UserRepository: Symbol.for("UserRepository"),
	WikiFolderRepository: Symbol.for("WikiFolderRepository"),
	WikiPageRepository: Symbol.for("WikiPageRepository"),
	WorldRepository: Symbol.for("WorldRepository"),

	// authorization rule sets
	ArticleAuthorizationRuleset: Symbol.for("ArticleAuthorizationRuleset"),
	ChunkAuthorizationRuleset: Symbol.for("ChunkAuthorizationRuleset"),
	FileAuthorizationRuleset: Symbol.for("FileAuthorizationRuleset"),
	GameAuthorizationRuleset: Symbol.for("GameAuthorizationRuleset"),
	ImageAuthorizationRuleset: Symbol.for("ImageAuthorizationRuleset"),
	ItemAuthorizationRuleset: Symbol.for("ItemAuthorizationRuleset"),
	ModelAuthorizationRuleset: Symbol.for("ModelAuthorizationRuleset"),
	MonsterAuthorizationRuleset: Symbol.for("MonsterAuthorizationRuleset"),
	PermissionAssignmentAuthorizationRuleset: Symbol.for("PermissionAssignmentAuthorizationRuleset"),
	PersonAuthorizationRuleset: Symbol.for("PersonAuthorizationRuleset"),
	PinAuthorizationRuleset: Symbol.for("PinAuthorizationRuleset"),
	PlaceAuthorizationRuleset: Symbol.for("PlaceAuthorizationRuleset"),
	RoleAuthorizationRuleset: Symbol.for("RoleAuthorizationRuleset"),
	ServerConfigAuthorizationRuleset: Symbol.for("ServerConfigAuthorizationRuleset"),
	UserAuthorizationRuleset: Symbol.for("UserAuthorizationRuleset"),
	WikiFolderAuthorizationRuleset: Symbol.for("WikiFolderAuthorizationRuleset"),
	WikiPageAuthorizationRuleset: Symbol.for("WikiPageAuthorizationRuleset"),
	WorldAuthorizationRuleset: Symbol.for("WorldAuthorizationRuleset"),

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

	// open 5e
	Open5eApiClient: Symbol.for("Open5eApiClient"),

	// cache
	Cache: Symbol.for("Cache"),

	// archive
	ArchiveFactory: Symbol.for("ArchiveFactory"),

	// event publisher
	EventPublisher: Symbol.for("EventPublisher"),

	// server
	ApiServer: Symbol.for("ApiServer"),
	ServerProperties: Symbol.for("ServerProperties"),

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

	// seeders
	RoleSeeder: Symbol.for("RoleSeeder"),
	ServerConfigSeeder: Symbol.for("ServerConfigSeeder"),

	// unit of work
	DbUnitOfWork: Symbol.for("DbUnitOfWork"),
	DbUnitOfWorkFactory: Symbol.for("DbUnitOfWorkFactory"),

	// repo mapper
	RepositoryMapper: Symbol.for("RepositoryMapper"),

	// mongodb
	FilterFactory: Symbol.for("FilterFactory"),
};
