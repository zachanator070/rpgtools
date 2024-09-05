import {RepositoryAccessor} from "../types";
import {injectable} from "inversify";
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
    calendarRepository: CalendarRepository;
    chunkRepository: ChunkRepository;
    eventRepository: EventWikiRepository;
    fileRepository: FileRepository;
    fogStrokeRepository: FogStrokeRepository;
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
    strokeRepository: StrokeRepository;
    userRepository: UserRepository;
    wikiFolderRepository: WikiFolderRepository;
    wikiPageRepository: WikiPageRepository;
    worldRepository: WorldRepository;

    constructor(
        articleRepository: ArticleRepository,
        calendarRepository: CalendarRepository,
        chunkRepository: ChunkRepository,
        eventRepository: EventWikiRepository,
        fileRepository: FileRepository,
        fogStrokeRepository: FogStrokeRepository,
        gameRepository: GameRepository,
        imageRepository: ImageRepository,
        itemRepository: ItemRepository,
        modelRepository: ModelRepository,
        monsterRepository: MonsterRepository,
        personRepository: PersonRepository,
        pinRepository: PinRepository,
        placeRepository: PlaceRepository,
        roleRepository: RoleRepository,
        serverConfigRepository: ServerConfigRepository,
        strokeRepository: StrokeRepository,
        userRepository: UserRepository,
        wikiFolderRepository: WikiFolderRepository,
        wikiPageRepository: WikiPageRepository,
        worldRepository: WorldRepository,
    ) {
        this.articleRepository = articleRepository;
        this.calendarRepository = calendarRepository;
        this.chunkRepository = chunkRepository;
        this.eventRepository = eventRepository;
        this.fileRepository = fileRepository;
        this.fogStrokeRepository = fogStrokeRepository;
        this.gameRepository = gameRepository;
        this.imageRepository = imageRepository;
        this.itemRepository = itemRepository;
        this.modelRepository = modelRepository;
        this.monsterRepository = monsterRepository;
        this.personRepository = personRepository;
        this.pinRepository = pinRepository;
        this.placeRepository = placeRepository;
        this.roleRepository = roleRepository;
        this.serverConfigRepository = serverConfigRepository;
        this.strokeRepository = strokeRepository;
        this.userRepository = userRepository;
        this.wikiFolderRepository = wikiFolderRepository;
        this.wikiPageRepository = wikiPageRepository;
        this.worldRepository = worldRepository;
    }

    abstract openTransaction(callback: () => any): Promise<void>;

}
