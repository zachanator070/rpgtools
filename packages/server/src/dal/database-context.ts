import {RepositoryAccessor} from "../types";
import {inject, injectable} from "inversify";
import {ArticleRepository} from "./repository/article-repository";
import {GameRepository} from "./repository/game-repository";
import {FileRepository} from "./repository/file-repository";
import {ChunkRepository} from "./repository/chunk-repository";
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
import EventWikiRepository from "./repository/event-wiki-repository";
import {CalendarRepository} from "./repository/calendar-repository";
import FogStrokeRepository from "./repository/fog-stroke-repository";
import StrokeRepository from "./repository/stroke-repository";

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