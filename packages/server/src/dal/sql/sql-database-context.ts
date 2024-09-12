import {DatabaseContext} from "../database-context.js";
import {ArticleRepository} from "../repository/article-repository.js";
import {CalendarRepository} from "../repository/calendar-repository.js";
import {ChunkRepository} from "../repository/chunk-repository.js";
import EventWikiRepository from "../repository/event-wiki-repository.js";
import {FileRepository} from "../repository/file-repository.js";
import FogStrokeRepository from "../repository/fog-stroke-repository.js";
import {GameRepository} from "../repository/game-repository.js";
import {ImageRepository} from "../repository/image-repository.js";
import {ItemRepository} from "../repository/item-repository.js";
import {ModelRepository} from "../repository/model-repository.js";
import {MonsterRepository} from "../repository/monster-repository.js";
import {PersonRepository} from "../repository/person-repository.js";
import {PinRepository} from "../repository/pin-repository.js";
import {PlaceRepository} from "../repository/place-repository.js";
import {RoleRepository} from "../repository/role-repository.js";
import {ServerConfigRepository} from "../repository/server-config-repository.js";
import StrokeRepository from "../repository/stroke-repository.js";
import {UserRepository} from "../repository/user-repository.js";
import {WikiFolderRepository} from "../repository/wiki-folder-repository.js";
import {WikiPageRepository} from "../repository/wiki-page-repository.js";
import {WorldRepository} from "../repository/world-repository.js";
import {Sequelize} from "sequelize";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";

@injectable()
export default class SQLDatabaseContext implements DatabaseContext {

    connection: Sequelize;

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
        connection: Sequelize,
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
        this.connection = connection;
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

    openTransaction(callback: () => any): Promise<any> {
        return this.connection.transaction(callback);
    }

}