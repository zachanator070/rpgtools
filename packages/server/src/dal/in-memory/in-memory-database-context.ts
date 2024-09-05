import {DatabaseContext} from "../database-context";
import {ArticleRepository} from "../repository/article-repository";
import {CalendarRepository} from "../repository/calendar-repository";
import {ChunkRepository} from "../repository/chunk-repository";
import EventWikiRepository from "../repository/event-wiki-repository";
import {FileRepository} from "../repository/file-repository";
import FogStrokeRepository from "../repository/fog-stroke-repository";
import {GameRepository} from "../repository/game-repository";
import {ImageRepository} from "../repository/image-repository";
import {ItemRepository} from "../repository/item-repository";
import {ModelRepository} from "../repository/model-repository";
import {MonsterRepository} from "../repository/monster-repository";
import {PersonRepository} from "../repository/person-repository";
import {PinRepository} from "../repository/pin-repository";
import {PlaceRepository} from "../repository/place-repository";
import {RoleRepository} from "../repository/role-repository";
import {ServerConfigRepository} from "../repository/server-config-repository";
import StrokeRepository from "../repository/stroke-repository";
import {UserRepository} from "../repository/user-repository";
import {WikiFolderRepository} from "../repository/wiki-folder-repository";
import {WikiPageRepository} from "../repository/wiki-page-repository";
import {WorldRepository} from "../repository/world-repository";

export default class InMemoryDatabaseContext extends DatabaseContext {

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

    openTransaction(callback: () => any): Promise<void> {
        return callback();
    }

}
