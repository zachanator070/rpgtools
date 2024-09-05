import {inject, injectable} from "inversify";
import AclEntryModel from "./models/acl-entry-model";
import {
    ACL_ENTRY, AGE,
    ARTICLE, CALENDAR,
    CHARACTER,
    CHARACTER_ATTRIBUTE,
    CHUNK, DAY_OF_THE_WEEK, EVENT_WIKI,
    FILE,
    FOG_STROKE,
    GAME,
    GAME_MODEL,
    IMAGE,
    ITEM,
    MESSAGE,
    MODEL,
    MONSTER, MONTH,
    PATH_NODE,
    PERSON,
    PIN,
    PLACE,
    REGISTER_CODE,
    ROLE,
    SERVER_CONFIG,
    STROKE, USER, WIKI_FOLDER,
    WIKI_PAGE, WORLD
} from "@rpgtools/common/src/type-constants";
import WikiPageModel from "./models/wiki-page-model";
import ArticleModel from "./models/article-model";
import ChunkModel from "./models/chunk-model";
import FileModel from "./models/file-model";
import GameModel from "./models/game-model";
import CharacterAttributeModel from "./models/game/character-attribute-model";
import CharacterModel from "./models/game/character-model";
import InGameModelModel from "./models/game/in-game-model-model";
import FogStrokeModel from "./models/game/fog-stroke-model";
import MessageModel from "./models/game/message-model";
import PathNodeModel from "./models/game/path-node-model";
import StrokeModel from "./models/game/stroke-model";
import ImageModel from "./models/image-model";
import ItemModel from "./models/item-model";
import {modeledWikiAttributes} from "./models/modeled-wiki-model";
import ModelModel from "./models/model-model";
import MonsterModel from "./models/monster-model";
import PersonModel from "./models/person-model";
import PinModel from "./models/pin-model";
import PlaceModel from "./models/place-model";
import {RoleModel} from "./models/role-model";
import ServerConfigModel from "./models/server-config-model";
import RegisterCodeModel from "./models/register-code-model";
import UserToRoleModel from "./models/user-to-role-model";
import UserModel from "./models/user-model";
import WikiFolderModel from "./models/wiki-folder-model";
import WikiFolderToWikiPageModel from "./models/wiki-folder-to-wiki-page-model";
import WorldModel from "./models/world-model";
import {Sequelize} from "sequelize";
import AdminUsersToServerConfigModel from "./models/admin-users-to-server-config-model";
import {SequelizeStorage, Umzug} from "umzug";
import * as initial from "./migrations/00_initial";
import * as events from "./migrations/01_events";
import * as related_wikis from "./migrations/02_related_wikis";
import * as game_message_size from './migrations/03_game_message_size';
import EventWikiModel from "./models/event-wiki-model";
import CalendarModel from "./models/calendar-model";
import AgeModel from "./models/calendar/age-model";
import MonthModel from "./models/calendar/month-model";
import DayOfTheWeekModel from "./models/calendar/day-of-the-week-model";
import WikiPageToWikiPageModel from "./models/wiki-page-to-wiki-page-model";
import {DatabaseContext} from "../database-context";
import SQLDatabaseContext from "./sql-database-context";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
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


@injectable()
export default class AbstractSqlDbEngine {


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

    connectAll(connection: Sequelize) {
        // Is there any better way to do this? How to handle a bunch of static methods with the same signature?
        // This violates the open/closed principle
        AclEntryModel.init(AclEntryModel.attributes, {sequelize: connection, modelName: ACL_ENTRY, freezeTableName: true});
        AdminUsersToServerConfigModel.init(AdminUsersToServerConfigModel.attributes, {sequelize: connection, modelName: 'AdminUsersToServerConfig', freezeTableName: true});
        WikiPageModel.init(WikiPageModel.attributes, {sequelize: connection, modelName: WIKI_PAGE, freezeTableName: true});
        WikiPageToWikiPageModel.init(WikiPageToWikiPageModel.attributes, {sequelize: connection, modelName: 'WikiPageToWikiPage', freezeTableName: true});
        ArticleModel.init(ArticleModel.attributes, {sequelize: connection, modelName: ARTICLE, freezeTableName: true});
        ChunkModel.init(ChunkModel.attributes, {sequelize: connection, modelName: CHUNK, freezeTableName: true});
        FileModel.init(FileModel.attributes, {sequelize: connection, modelName: FILE, freezeTableName: true});

        GameModel.init(GameModel.attributes, {sequelize: connection, modelName: GAME, freezeTableName: true});
        CharacterAttributeModel.init(CharacterAttributeModel.attributes, {sequelize: connection, modelName: CHARACTER_ATTRIBUTE, freezeTableName: true});
        CharacterModel.init(CharacterModel.attributes, {sequelize: connection, modelName: CHARACTER, freezeTableName: true});
        InGameModelModel.init(InGameModelModel.attributes, {sequelize: connection, modelName: GAME_MODEL, freezeTableName: true});
        FogStrokeModel.init(FogStrokeModel.attributes, {sequelize: connection, modelName: FOG_STROKE, freezeTableName: true});
        MessageModel.init(MessageModel.attributes, {sequelize: connection, modelName: MESSAGE, freezeTableName: true});
        PathNodeModel.init(PathNodeModel.attributes, {sequelize: connection, modelName: PATH_NODE, freezeTableName: true});
        StrokeModel.init(StrokeModel.attributes, {sequelize: connection, modelName: STROKE, freezeTableName: true});

        ImageModel.init(ImageModel.attributes, {sequelize: connection, modelName: IMAGE, freezeTableName: true});
        ItemModel.init(modeledWikiAttributes, {sequelize: connection, modelName: ITEM, freezeTableName: true});
        ModelModel.init(ModelModel.attributes, {sequelize: connection, modelName: MODEL, freezeTableName: true});
        MonsterModel.init(modeledWikiAttributes, {sequelize: connection, modelName: MONSTER, freezeTableName: true});
        PersonModel.init(modeledWikiAttributes, {sequelize: connection, modelName: PERSON, freezeTableName: true});
        PinModel.init(PinModel.attributes, {sequelize: connection, modelName: PIN, freezeTableName: true});
        PlaceModel.init(PlaceModel.attributes, {sequelize: connection, modelName: PLACE, freezeTableName: true});
        RoleModel.init(RoleModel.attributes, {sequelize: connection, modelName: ROLE, freezeTableName: true});
        ServerConfigModel.init(ServerConfigModel.attributes, {sequelize: connection, modelName: SERVER_CONFIG, freezeTableName: true});
        RegisterCodeModel.init(RegisterCodeModel.attributes, {sequelize: connection, modelName: REGISTER_CODE, freezeTableName: true});
        UserToRoleModel.init(UserToRoleModel.attributes, {sequelize: connection, modelName: 'UserToRole', freezeTableName: true});
        UserModel.init(UserModel.attributes, {sequelize: connection, modelName: USER, freezeTableName: true});
        WikiFolderModel.init(WikiFolderModel.attributes, {sequelize: connection, modelName: WIKI_FOLDER, freezeTableName: true});
        WikiFolderToWikiPageModel.init(WikiFolderToWikiPageModel.attributes, {sequelize: connection, modelName: 'WikiFolderToWikiPage', freezeTableName: true})
        WorldModel.init(WorldModel.attributes, {sequelize: connection, modelName: WORLD, freezeTableName: true});
        EventWikiModel.init(EventWikiModel.attributes, {sequelize: connection, modelName: EVENT_WIKI, freezeTableName: true});

        CalendarModel.init(CalendarModel.attributes, {sequelize: connection, modelName: CALENDAR, freezeTableName: true});
        AgeModel.init(AgeModel.attributes, {sequelize: connection, modelName: AGE, freezeTableName: true});
        MonthModel.init(MonthModel.attributes, {sequelize: connection, modelName: MONTH, freezeTableName: true});
        DayOfTheWeekModel.init(DayOfTheWeekModel.attributes, {sequelize: connection, modelName: DAY_OF_THE_WEEK, freezeTableName: true});

        AclEntryModel.connect();

        ArticleModel.connect();
        WikiPageModel.connect();
        ChunkModel.connect();
        FileModel.connect();
        // all game models
        GameModel.connect();
        CharacterAttributeModel.connect();
        CharacterModel.connect();
        FogStrokeModel.connect();
        InGameModelModel.connect();
        MessageModel.connect();
        PathNodeModel.connect();
        StrokeModel.connect();
        ImageModel.connect();
        ItemModel.connect();
        ModelModel.connect();
        MonsterModel.connect();
        PersonModel.connect();
        PinModel.connect();
        PlaceModel.connect();
        RoleModel.connect();
        ServerConfigModel.connect();
        RegisterCodeModel.connect();
        UserModel.connect();
        WikiFolderModel.connect();
        WorldModel.connect();

        EventWikiModel.connect();
        CalendarModel.connect();
        AgeModel.connect();
        MonthModel.connect();
        DayOfTheWeekModel.connect();
    }

    async migrate(connection: Sequelize): Promise<void> {

        const umzug = new Umzug({
            migrations: [
                {
                    name: '00_initial',
                    ...initial
                },
                {
                    name: '01_events',
                    ...events
                },
                {
                    name: '02_related_wikis',
                    ...related_wikis
                },
                {
                    name: '03_game_message_size',
                    ...game_message_size
                }
            ],
            context: connection.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize: connection }),
            logger: console,
        });
        await umzug.up();
    }

    async createDatabaseContext(connection: Sequelize): Promise<DatabaseContext> {
        const context = new SQLDatabaseContext(
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
        context.connection = connection;
        return context;
    }

}
