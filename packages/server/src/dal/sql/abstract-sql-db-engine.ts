import {inject, injectable, interfaces} from "inversify";
import AclEntryModel from "./models/acl-entry-model.js";
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
    INVITE,
    ITEM,
    MESSAGE,
    MODEL,
    MONSTER, MONTH,
    PATH_NODE,
    PERSON,
    PIN,
    PLACE,
    ROLE,
    SERVER_CONFIG,
    STROKE, TOKEN_ICON, USER, WIKI_FOLDER,
    WIKI_PAGE, WORLD
} from "@rpgtools/common/src/type-constants.js";
import WikiPageModel from "./models/wiki-page-model.js";
import ArticleModel from "./models/article-model.js";
import ChunkModel from "./models/chunk-model.js";
import FileModel from "./models/file-model.js";
import GameModel from "./models/game-model.js";
import CharacterAttributeModel from "./models/game/character-attribute-model.js";
import CharacterModel from "./models/game/character-model.js";
import InGameModelModel from "./models/game/in-game-model-model.js";
import FogStrokeModel from "./models/game/fog-stroke-model.js";
import MessageModel from "./models/game/message-model.js";
import PathNodeModel from "./models/game/path-node-model.js";
import StrokeModel from "./models/game/stroke-model.js";
import ImageModel from "./models/image-model.js";
import TokenIconModel from "./models/token-icon-model.js";
import ItemModel from "./models/item-model.js";
import {modeledWikiAttributes} from "./models/modeled-wiki-model.js";
import ModelModel from "./models/model-model.js";
import MonsterModel from "./models/monster-model.js";
import PersonModel from "./models/person-model.js";
import PinModel from "./models/pin-model.js";
import PlaceModel from "./models/place-model.js";
import {RoleModel} from "./models/role-model.js";
import ServerConfigModel from "./models/server-config-model.js";
import InviteModel from "./models/invite-model.js";
import UserToRoleModel from "./models/user-to-role-model.js";
import UserModel from "./models/user-model.js";
import WikiFolderModel from "./models/wiki-folder-model.js";
import WikiFolderToWikiPageModel from "./models/wiki-folder-to-wiki-page-model.js";
import WorldModel from "./models/world-model.js";
import {Sequelize} from "sequelize";
import AdminUsersToServerConfigModel from "./models/admin-users-to-server-config-model.js";
import {SequelizeStorage, Umzug} from "umzug";
import * as initial from "./migrations/00_initial.js";
import * as events from "./migrations/01_events.js";
import * as related_wikis from "./migrations/02_related_wikis.js";
import * as game_message_size from './migrations/03_game_message_size.js';
import * as message_to_text from './migrations/04_message_to_text.js';
import * as token_icon from './migrations/05_token_icon.js';
import * as invites from './migrations/06_invites.js';
import * as remove_unlock_code from './migrations/07_remove_unlock_code.js';
import EventWikiModel from "./models/event-wiki-model.js";
import CalendarModel from "./models/calendar-model.js";
import AgeModel from "./models/calendar/age-model.js";
import MonthModel from "./models/calendar/month-model.js";
import DayOfTheWeekModel from "./models/calendar/day-of-the-week-model.js";
import WikiPageToWikiPageModel from "./models/wiki-page-to-wiki-page-model.js";
import {DatabaseContext} from "../database-context.js";
import SQLDatabaseContext from "./sql-database-context.js";
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
import {InviteRepository} from "../repository/invite-repository.js";
import StrokeRepository from "../repository/stroke-repository.js";
import {UserRepository} from "../repository/user-repository.js";
import {WikiFolderRepository} from "../repository/wiki-folder-repository.js";
import {WikiPageRepository} from "../repository/wiki-page-repository.js";
import {WorldRepository} from "../repository/world-repository.js";
import {TokenIconRepository} from "../repository/token-icon-repository.js";
import { DbEngine } from "src/types.js";
import Logger from "../../logging/logger.js";


@injectable()
export default abstract class AbstractSqlDbEngine implements DbEngine {
    
    connection: Sequelize;

    stdOutLogging = process.env.SQL_LOGGING || 'false';


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
    @inject(INJECTABLE_TYPES.InviteRepository)
    inviteRepository: InviteRepository;
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
    @inject(INJECTABLE_TYPES.TokenIconRepository)
    tokenIconRepository: TokenIconRepository;
    @inject(INJECTABLE_TYPES.Logger)
    logger: Logger;

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
        TokenIconModel.init(TokenIconModel.attributes, {sequelize: connection, modelName: TOKEN_ICON, freezeTableName: true});
        ItemModel.init(modeledWikiAttributes, {sequelize: connection, modelName: ITEM, freezeTableName: true});
        ModelModel.init(ModelModel.attributes, {sequelize: connection, modelName: MODEL, freezeTableName: true});
        MonsterModel.init(modeledWikiAttributes, {sequelize: connection, modelName: MONSTER, freezeTableName: true});
        PersonModel.init(modeledWikiAttributes, {sequelize: connection, modelName: PERSON, freezeTableName: true});
        PinModel.init(PinModel.attributes, {sequelize: connection, modelName: PIN, freezeTableName: true});
        PlaceModel.init(PlaceModel.attributes, {sequelize: connection, modelName: PLACE, freezeTableName: true});
        RoleModel.init(RoleModel.attributes, {sequelize: connection, modelName: ROLE, freezeTableName: true});
        ServerConfigModel.init(ServerConfigModel.attributes, {sequelize: connection, modelName: SERVER_CONFIG, freezeTableName: true});
        InviteModel.init(InviteModel.attributes, {sequelize: connection, modelName: INVITE, freezeTableName: true});
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
        TokenIconModel.connect();
        ItemModel.connect();
        ModelModel.connect();
        MonsterModel.connect();
        PersonModel.connect();
        PinModel.connect();
        PlaceModel.connect();
        RoleModel.connect();
        ServerConfigModel.connect();
        InviteModel.connect();
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
                },
                {
                    name: '04_message_to_text',
                    ...message_to_text
                },
                {
                    name: '05_token_icon',
                    ...token_icon
                },
                {
                    name: '06_invites',
                    ...invites
                },
                {
                    name: '07_remove_unlock_code',
                    ...remove_unlock_code
                }
            ],
            context: connection.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize: connection }),
            logger: {
                info: (msg: Record<string, unknown>) => this.logger.info('Umzug info', msg),
                warn: (msg: Record<string, unknown>) => this.logger.warn('Umzug warn', msg),
                error: (msg: Record<string, unknown>) => this.logger.error('Umzug error', msg),
                debug: (msg: Record<string, unknown>) => this.logger.debug('Umzug debug', msg),
            },
        });
        await umzug.up();
    }

    abstract getConnectionString(): string;
    abstract getRedactedConnectionString(): string;
    abstract createDatabaseIfNeeded(name: string): Promise<void>;

    abstract dbName: string;
    abstract host: string;
    
    async connect(): Promise<void> {
        this.logger.info(`Connecting to SQL database ${this.getRedactedConnectionString()}`)
        await this.createDatabaseIfNeeded(this.dbName);
        this.connection = new Sequelize(
            this.getConnectionString(),
            {
                logging: this.stdOutLogging.toLowerCase() === 'true' && this.logger.debug
            }
        );

        this.connectAll(this.connection);

        this.logger.debug('Syncing table schemas');
        await this.migrate(this.connection);
    };

    async clearDb() : Promise<void> {
        try {
            // Use raw SQL to drop all tables to avoid Sequelize enum issues
            await this.connection.query('DROP SCHEMA public CASCADE');
            await this.connection.query('CREATE SCHEMA public');
        } catch (error) {
            this.logger.error('Error clearing database:', error);
        }
    }

    async disconnect(): Promise<void> {
        await this.connection.close();
    }

    setDbHost(host: string): void {
        this.host = host;
    }

    async changeDb(name: string): Promise<void> {
        this.dbName = name;
        if(this.connection) {
            await this.disconnect();
            await this.connect();
        }
    }

    async createDatabaseContext(): Promise<DatabaseContext> {
        return new SQLDatabaseContext(
            this.connection,
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
            this.inviteRepository,
            this.strokeRepository,
            this.userRepository,
            this.wikiFolderRepository,
            this.wikiPageRepository,
            this.worldRepository,
            this.tokenIconRepository
        );
    }
}