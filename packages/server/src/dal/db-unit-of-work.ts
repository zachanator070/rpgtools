import {
	ArticleRepository,
	ChunkRepository,
	FileRepository,
	GameRepository,
	ImageRepository,
	ItemRepository,
	ModelRepository,
	MonsterRepository,
	PermissionAssignmentRepository,
	PersonRepository,
	PinRepository,
	PlaceRepository,
	RoleRepository,
	ServerConfigRepository,
	UnitOfWork,
	UserRepository,
	WikiFolderRepository,
	WikiPageRepository,
	WorldRepository,
} from "../types";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

export class DbUnitOfWork implements UnitOfWork {
	@inject(INJECTABLE_TYPES.ArticleRepository)
	articleRepository: ArticleRepository;
	@inject(INJECTABLE_TYPES.ChunkRepository)
	chunkRepository: ChunkRepository;
	@inject(INJECTABLE_TYPES.FileRepository)
	fileRepository: FileRepository;
	@inject(INJECTABLE_TYPES.GameRepository)
	gameRepository: GameRepository;
	@inject(INJECTABLE_TYPES.ImageRepository)
	imageRepository: ImageRepository;
	@inject(INJECTABLE_TYPES.ItemRepository)
	itemRepository: ItemRepository;
	@inject(INJECTABLE_TYPES.ModelRepository)
	modelRepository: ModelRepository;
	@inject(INJECTABLE_TYPES.MonsterRepository)
	monsterRepository: MonsterRepository;
	@inject(INJECTABLE_TYPES.PermissionAssignmentRepository)
	permissionAssignmentRepository: PermissionAssignmentRepository;
	@inject(INJECTABLE_TYPES.PersonRepository)
	personRepository: PersonRepository;
	@inject(INJECTABLE_TYPES.PinRepository)
	pinRepository: PinRepository;
	@inject(INJECTABLE_TYPES.PlaceRepository)
	placeRepository: PlaceRepository;
	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: RoleRepository;
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: ServerConfigRepository;
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;
	@inject(INJECTABLE_TYPES.WikiPageRepository)
	wikiPageRepository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	constructor() {
		// here you would create a generic db context and share with all the repos, the generic db context will share
		// a type of context for each type of db being used
	}
	commit = async (): Promise<void> => {
		return;
	};
}
