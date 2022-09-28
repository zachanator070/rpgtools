import { container } from "../../src/di/inversify";
import {
	ApiServer, DbEngine,
	Factory,
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
import {DatabaseContext} from "../../src/dal/database-context";
import UserFactory from "../../src/domain-entities/factory/user-factory";

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

	@inject(INJECTABLE_TYPES.UserFactory)
	userFactory: UserFactory

	@inject(INJECTABLE_TYPES.DatabaseContextFactory)
	databaseContextFactory: Factory<DatabaseContext>;

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
	testRole: Role;
	newFolder: WikiFolder;
	otherPage: WikiPage;
	pin: Pin;

	async reset() {
		const session = await this.dbEngine.createDatabaseSession();
		const databaseContext = this.databaseContextFactory({session});

		this.tester1 = await databaseContext.userRepository.findOneByUsername("tester");
		this.tester1SecurityContext = await this.securityContextFactory.create(this.tester1);

		this.currentUser = this.tester1;
		this.currentUserSecurityContext = this.tester1SecurityContext;

		this.tester2 = this.userFactory.build({_id: null, email: "tester2@gmail.com", username: "tester2", password: "", tokenVersion: "", currentWorld: null, roles: []});
		await databaseContext.userRepository.create(this.tester2);
		this.tester2SecurityContext = await this.securityContextFactory.create(this.tester2);

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
		await session.commit();
		return this;
	};

}
