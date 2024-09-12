import {RepositoryAccessor} from "../types";
import {inject, injectable} from "inversify";
import {ArticleRepository} from "./repository/article-repository.js";
import {GameRepository} from "./repository/game-repository.js";
import {FileRepository} from "./repository/file-repository.js";
import {ChunkRepository} from "./repository/chunk-repository.js";
import {ImageRepository} from "./repository/image-repository.js";
import {ItemRepository} from "./repository/item-repository.js";
import {ModelRepository} from "./repository/model-repository.js";
import {MonsterRepository} from "./repository/monster-repository.js";
import {PersonRepository} from "./repository/person-repository.js";
import {PinRepository} from "./repository/pin-repository.js";
import {PlaceRepository} from "./repository/place-repository.js";
import {RoleRepository} from "./repository/role-repository.js";
import {ServerConfigRepository} from "./repository/server-config-repository.js";
import {UserRepository} from "./repository/user-repository.js";
import {WikiFolderRepository} from "./repository/wiki-folder-repository.js";
import {WikiPageRepository} from "./repository/wiki-page-repository.js";
import {WorldRepository} from "./repository/world-repository.js";
import EventWikiRepository from "./repository/event-wiki-repository.js";
import {CalendarRepository} from "./repository/calendar-repository.js";
import FogStrokeRepository from "./repository/fog-stroke-repository.js";
import StrokeRepository from "./repository/stroke-repository.js";

@injectable()
export abstract class DatabaseContext implements RepositoryAccessor {

    articleRepository: ArticleRepository;
    chunkRepository: ChunkRepository;
    fileRepository: FileRepository;
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
    eventRepository: EventWikiRepository;
    calendarRepository: CalendarRepository;
    fogStrokeRepository: FogStrokeRepository;
    strokeRepository: StrokeRepository;

    abstract openTransaction(callback: () => any): Promise<void>;

}