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
} from "../../types";
import { InMemoryArticleRepository } from "./repositories/in-memory-article-repository";
import { InMemoryChunkRepository } from "./repositories/in-memory-chunk-repository";
import { InMemoryFileRepository } from "./repositories/in-memory-file-repository";
import { InMemoryGameRepository } from "./repositories/in-memory-game-repository";
import { InMemoryImageRepository } from "./repositories/in-memory-image-repository";
import { InMemoryItemRepository } from "./repositories/in-memory-item-repository";
import { InMemoryModelRepository } from "./repositories/in-memory-model-repository";
import { InMemoryMonsterRepository } from "./repositories/in-memory-monster-repository";
import { InMemoryPermissionAssignmentRepository } from "./repositories/in-memory-permission-assignment-repository";
import { InMemoryPersonRepository } from "./repositories/in-memory-person-repository";
import { InMemoryPinRepository } from "./repositories/in-memory-pin-repository";
import { InMemoryPlaceRepository } from "./repositories/in-memory-place-repository";
import { InMemoryRoleRepository } from "./repositories/in-memory-role-repository";
import { InMemoryServerConfigRepository } from "./repositories/in-memory-server-config-repository";
import { InMemoryUserRepository } from "./repositories/in-memory-user-repository";
import { InMemoryWikiFolderRepository } from "./repositories/in-memory-wiki-folder-repository";
import { InMemoryWikiPageRepository } from "./repositories/in-memory-wiki-page-repository";
import { InMemoryWorldRepository } from "./repositories/in-memory-world-repository";

export class InMemoryUnitOfWork implements UnitOfWork {
	articleRepository: ArticleRepository = new InMemoryArticleRepository();
	chunkRepository: ChunkRepository = new InMemoryChunkRepository();
	fileRepository: FileRepository = new InMemoryFileRepository();
	gameRepository: GameRepository = new InMemoryGameRepository();
	imageRepository: ImageRepository = new InMemoryImageRepository();
	itemRepository: ItemRepository = new InMemoryItemRepository();
	modelRepository: ModelRepository = new InMemoryModelRepository();
	monsterRepository: MonsterRepository = new InMemoryMonsterRepository();
	permissionAssignmentRepository: PermissionAssignmentRepository = new InMemoryPermissionAssignmentRepository();
	personRepository: PersonRepository = new InMemoryPersonRepository();
	pinRepository: PinRepository = new InMemoryPinRepository();
	placeRepository: PlaceRepository = new InMemoryPlaceRepository();
	roleRepository: RoleRepository = new InMemoryRoleRepository();
	serverConfigRepository: ServerConfigRepository = new InMemoryServerConfigRepository();
	userRepository: UserRepository = new InMemoryUserRepository();
	wikiFolderRepository: WikiFolderRepository = new InMemoryWikiFolderRepository();
	wikiPageRepository: WikiPageRepository = new InMemoryWikiPageRepository();
	worldRepository: WorldRepository = new InMemoryWorldRepository();

	commit = async (): Promise<void> => {
		return;
	};
}
