import {inject, injectable} from "inversify";
import {DbEngine} from "../../types";
import * as console from "node:console";
import {DatabaseContext} from "../database-context.js";
import InMemoryDatabaseContext from "./in-memory-database-context.js";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
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

@injectable()
export default class InMemoryDbEngine implements DbEngine {

    @inject(INJECTABLE_TYPES.ArticleRepository)
    articleRepository: ArticleRepository;
    @inject(INJECTABLE_TYPES.CalendarRepository)
    calendarRepository: CalendarRepository;
    @inject(INJECTABLE_TYPES.ChunkRepository)
    chunkRepository: ChunkRepository;
    @inject(INJECTABLE_TYPES.EventWikiRepository)
    eventRepository: EventWikiRepository;
    @inject(INJECTABLE_TYPES.FileRepository)
    fileRepository: FileRepository;
    @inject(INJECTABLE_TYPES.FogStrokeRepository)
    fogStrokeRepository: FogStrokeRepository;
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
    @inject(INJECTABLE_TYPES.StrokeRepository)
    strokeRepository: StrokeRepository;
    @inject(INJECTABLE_TYPES.UserRepository)
    userRepository: UserRepository;
    @inject(INJECTABLE_TYPES.WikiFolderRepository)
    wikiFolderRepository: WikiFolderRepository;
    @inject(INJECTABLE_TYPES.WikiPageRepository)
    wikiPageRepository: WikiPageRepository;
    @inject(INJECTABLE_TYPES.WorldRepository)
    worldRepository: WorldRepository;

    changeDb(name: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    clearDb(): Promise<void> {
        return Promise.resolve(undefined);
    }

    connect(): Promise<void> {
        console.warn('Using in memory database. All data will be erased when service restarts!');
        return Promise.resolve(undefined);
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    setDbHost(host: string): void {
    }

    async createDatabaseContext(): Promise<DatabaseContext> {
        return new InMemoryDatabaseContext(
            this.articleRepository,
            this.calendarRepository,
            this.chunkRepository,
            this.eventRepository,
            this.fileRepository,
            this.fogStrokeRepository,
            this.gameRepository,
            this.imageRepository,
            this.itemRepository,
            this.modelRepository,
            this.monsterRepository,
            this.personRepository,
            this.pinRepository,
            this.placeRepository,
            this.roleRepository,
            this.serverConfigRepository,
            this.strokeRepository,
            this.userRepository,
            this.wikiFolderRepository,
            this.wikiPageRepository,
            this.worldRepository,
        );
    }

}