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
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
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

	commit = async (): Promise<void> => {
		return;
	};

	rollback = async (): Promise<void> => {
		return;
	};
}
