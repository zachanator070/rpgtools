import { container } from "../../src/di/inversify";
import {
	ApiServer, DbEngine,
} from "../../src/types";
import { INJECTABLE_TYPES } from "../../src/di/injectable-types";
import { SecurityContextFactory } from "../../src/security/security-context-factory";
import { MockSessionContextFactory } from "./mock-session-context-factory";
import {AuthorizationService} from "../../src/services/authorization-service";
import {WorldService} from "../../src/services/world-service";
import {WikiFolderService} from "../../src/services/wiki-folder-service";
import {WikiPageService} from "../../src/services/wiki-page-service";
import {inject, injectable} from "inversify";
import {User} from "../../src/domain-entities/user";
import {SecurityContext} from "../../src/security/security-context";
import {World} from "../../src/domain-entities/world";
import {Role} from "../../src/domain-entities/role";
import {WikiFolder} from "../../src/domain-entities/wiki-folder";
import {WikiPage} from "../../src/domain-entities/wiki-page";
import {Pin} from "../../src/domain-entities/pin";
import UserFactory from "../../src/domain-entities/factory/user-factory";
import {ImageService} from "../../src/services/image-service";
import fs from "fs";
import {Image} from "../../src/domain-entities/image";
import {FileUpload} from "graphql-upload";
import { Model } from "../../src/domain-entities/model";
import {Game} from "../../src/domain-entities/game";
import {ModelService} from "../../src/services/model-service";
import {GameService} from "../../src/services/game-service";
import Calendar from "../../src/domain-entities/calendar";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";
import {Readable} from "stream";
import {Buffer} from "buffer";

export const testGamePassword = 'tester1password';

@injectable()
export class DefaultTestingContext {

	@inject(INJECTABLE_TYPES.SecurityContextFactory)
	securityContextFactory: SecurityContextFactory;

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.WikiFolderService)
	wikiFolderService: WikiFolderService;

	@inject(INJECTABLE_TYPES.WikiPageService)
	wikiPageService: WikiPageService;

	@inject(INJECTABLE_TYPES.ImageService)
	imageService: ImageService;

	@inject(INJECTABLE_TYPES.ModelService)
	modelService: ModelService;

	@inject(INJECTABLE_TYPES.UserFactory)
	userFactory: UserFactory

	@inject(INJECTABLE_TYPES.GameService)
	gameService: GameService;

	@inject(INJECTABLE_TYPES.DbEngine)
	dbEngine: DbEngine;

	@inject(INJECTABLE_TYPES.SessionContextFactory)
	mockSessionContextFactory: MockSessionContextFactory;

	@inject(INJECTABLE_TYPES.ApiServer)
	server: ApiServer;

	currentUser: User;
	currentUserSecurityContext: SecurityContext;
	tester1: User;
	tester1SecurityContext: SecurityContext;
	tester2: User;
	tester2SecurityContext: SecurityContext;

	world: World;
	mapImage: Image;
	testRole: Role;
	newFolder: WikiFolder;
	otherPage: WikiPage;
	pin: Pin;

	model: Model;
	game: Game;

	calendar1: Calendar;
    calendar2: Calendar;

	async reset() {
		const databaseContext = await this.dbEngine.createDatabaseContext();

		this.tester1 = await databaseContext.userRepository.findOneByUsername("tester");
		this.tester1SecurityContext = await this.securityContextFactory.create(this.tester1, databaseContext);

		this.currentUser = this.tester1;
		this.currentUserSecurityContext = this.tester1SecurityContext;

		this.tester2 = this.userFactory.build({email: "tester2@gmail.com", username: "tester2", password: "", tokenVersion: "", currentWorld: null, roles: []});
		await databaseContext.userRepository.create(this.tester2);
		this.tester2SecurityContext = await this.securityContextFactory.create(this.tester2, databaseContext);

		this.mockSessionContextFactory.setCurrentUser(this.currentUser);

		const worldService = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		this.world = await worldService.createWorld("Earth", false, this.tester1SecurityContext, databaseContext);
		this.testRole = await this.authorizationService.createRole(
			this.tester1SecurityContext,
			this.world._id,
			"other role",
			databaseContext
		);
		await this.wikiFolderService.createFolder(
			this.tester1SecurityContext,
			"new folder",
			this.world.rootFolder,
			databaseContext
		);
		this.newFolder = await databaseContext.wikiFolderRepository.findOneByNameAndWorld('new folder', this.world._id);
		await this.wikiPageService.createWiki(this.tester1SecurityContext, "new page", this.newFolder._id, databaseContext);
		await this.wikiPageService.createWiki(
			this.tester1SecurityContext,
			"other page",
			this.world.rootFolder,
			databaseContext
		);
		this.otherPage = await databaseContext.wikiPageRepository.findOneByNameAndWorld('other page', this.world._id);
		await worldService.createPin(
			this.tester1SecurityContext,
			this.world.wikiPage,
			this.otherPage._id,
			0,
			0,
			databaseContext
		);
		this.pin = await databaseContext.pinRepository.findOneByMapAndPage(
			this.world.wikiPage,
			this.otherPage._id
		);
		this.calendar1 = await worldService.upsertCalendar(
			null,
			this.world._id,
			this.world.name + ' calendar1',
			[{
				_id: null,
				name: "age 1",
				numYears: 100,
				months: [{
					name: 'month 1',
					numDays: 30,
					_id: null
				}],
				daysOfTheWeek: [{
					name: 'Monday',
					_id: null
				}]
			}],
			this.tester1SecurityContext,
			databaseContext
		);
        this.calendar2 = await worldService.upsertCalendar(
            null,
            this.world._id,
            this.world.name + ' calendar2',
            [{
                _id: null,
                name: "age 1",
                numYears: 100,
                months: [{
                    name: 'month 1',
                    numDays: 30,
                    _id: null
                }],
                daysOfTheWeek: [{
                    name: 'Monday',
                    _id: null
                }]
            }],
            this.tester1SecurityContext,
            databaseContext
        );
		return this;
	};

	async setupGame() {

		const databaseContext = await this.dbEngine.createDatabaseContext();

		this.game = await this.gameService.createGame(
			this.tester1SecurityContext,
			this.world._id,
			testGamePassword,
			this.tester1.username,
			databaseContext
		);

		const filename = "tests/integration/resolvers/mutations/pikachu.glb";
		const testFile: FileUpload = {
			encoding: "binary",
			mimetype: "application/gltf",
			filename: filename,
			createReadStream: () => fs.createReadStream(filename),
		};

		this.model = await this.modelService.createModel(
			this.tester1SecurityContext,
			this.world._id,
			'test model',
			testFile,
			2,
			1,
			1,
			"some notes",
			databaseContext
		);

		await this.gameService.addModel(
			this.tester1SecurityContext,
			this.game._id,
			this.model._id,
			this.otherPage._id,
			'#ffffff',
			databaseContext
		);

		this.game = await this.gameService.getGame(this.tester1SecurityContext, this.game._id, databaseContext);
	}

	async setupEvents() {

        // create 3 events in calendar1, 2 events in calendar2, 2 events in calendar 1 and 1 event in calendar2 link to root wiki page
		const databaseContext = await this.dbEngine.createDatabaseContext();

		const createEventContent = (linkedWikiId: string): Buffer => {
			const testData = `{"ops":[{"insert":"At a time where "},{"insert":{"mention":{"index":"0","denotationChar":"","value":"<a href=\\"/ui/world/${this.world._id}/wiki/${linkedWikiId}/view\\" target=_self>Middle Earth","link":"/ui/world/${this.world._id}/wiki/${linkedWikiId}/view","target":"_self"}}},{"insert":" comes to a time of peace.\\n"}]}`;
			return Buffer.from(testData, 'utf-8');
		}

        // create events in calendar1
		const first = await this.wikiPageService.createWiki(
            this.tester1SecurityContext,
            'first',
            this.world.rootFolder,
            databaseContext
        );
		await this.wikiPageService.updateWiki(
            this.tester1SecurityContext,
            first._id,
            databaseContext,
            Readable.from(createEventContent(this.world.wikiPage)),
            null,
            null,
            EVENT_WIKI
        );
        await this.wikiPageService.updateEventWiki(
            this.tester1SecurityContext,
            first._id,
            this.calendar1._id,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            databaseContext
        );

		const second = await this.wikiPageService.createWiki(
            this.tester1SecurityContext,
            'second',
            this.world.rootFolder,
            databaseContext
        );
		await this.wikiPageService.updateWiki(
            this.tester1SecurityContext,
            second._id,
            databaseContext,
            Readable.from(createEventContent(this.world.wikiPage)),
            null,
            null,
            EVENT_WIKI
        );
        await this.wikiPageService.updateEventWiki(
            this.tester1SecurityContext,
            second._id,
            this.calendar1._id,
            1,
            2,
            1,
            1,
            2,
            2,
            2,
            databaseContext
        );

        const unrelated = await this.wikiPageService.createWiki(
            this.tester1SecurityContext,
            'unrelated',
            this.world.rootFolder,
            databaseContext
        );
        await this.wikiPageService.updateWiki(
            this.tester1SecurityContext,
            unrelated._id,
            databaseContext,
            null,
            null,
            null,
            EVENT_WIKI
        );
        await this.wikiPageService.updateEventWiki(
            this.tester1SecurityContext,
            unrelated._id,
            this.calendar1._id,
            1,
            3,
            1,
            1,
            3,
            3,
            3,
            databaseContext
        );

        // create events in calendar2
        const cal2First = await this.wikiPageService.createWiki(
            this.tester1SecurityContext,
            'other first',
            this.world.rootFolder,
            databaseContext
        );
        await this.wikiPageService.updateWiki(
            this.tester1SecurityContext,
            cal2First._id,
            databaseContext,
            Readable.from(createEventContent(this.world.wikiPage)),
            null,
            null,
            EVENT_WIKI
        );
        await this.wikiPageService.updateEventWiki(
            this.tester1SecurityContext,
            cal2First._id,
            this.calendar2._id,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            databaseContext
        );

        const cal2Unrelated = await this.wikiPageService.createWiki(
            this.tester1SecurityContext,
            'other unrelated',
            this.world.rootFolder,
            databaseContext
        );
        await this.wikiPageService.updateWiki(
            this.tester1SecurityContext,
            cal2Unrelated._id,
            databaseContext,
            null,
            null,
            null,
            EVENT_WIKI
        );
        await this.wikiPageService.updateEventWiki(
            this.tester1SecurityContext,
            cal2Unrelated._id,
            this.calendar2._id,
            1,
            3,
            1,
            1,
            3,
            3,
            3,
            databaseContext
        );

	}

}
