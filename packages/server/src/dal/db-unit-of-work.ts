import {
	UnitOfWork,

} from "../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {ChunkRepository} from "./repository/chunk-repository";
import {FileRepository} from "./repository/file-repository";
import {GameRepository} from "./repository/game-repository";
import {ImageRepository} from "./repository/image-repository";
import {ItemRepository} from "./repository/item-repository";
import {ModelRepository} from "./repository/model-repository";
import {MonsterRepository} from "./repository/monster-repository";
import {PersonRepository} from "./repository/person-repository";
import {PinRepository} from "./repository/pin-repository";
import {PlaceRepository} from "./repository/place-repository";
import {RoleRepository} from "./repository/role-repository";
import {ServerConfigRepository} from "./repository/server-config-repository";
import {UserRepository} from "./repository/user-repository";
import {WikiFolderRepository} from "./repository/wiki-folder-repository";
import {WikiPageRepository} from "./repository/wiki-page-repository";
import {WorldRepository} from "./repository/world-repository";
import {ArticleRepository} from "./repository/article-repository";

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
