import { FilterCondition } from "../../src/dal/filter-condition";
import { container } from "../../src/di/inversify";
import {
	ApiServer,
	Factory,
	UnitOfWork,
	UserFactory,
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

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	unitOfWorkFactory: Factory<UnitOfWork>;

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
		const unitOfWork = this.unitOfWorkFactory({});

		this.tester1 = await unitOfWork.userRepository.findOne([new FilterCondition("username", "tester")]);
		this.tester1SecurityContext = await this.securityContextFactory.create(this.tester1);

		this.currentUser = this.tester1;
		this.currentUserSecurityContext = this.tester1SecurityContext;

		this.tester2 = this.userFactory({_id: null, email: "tester2@gmail.com", username: "tester2", password: "", tokenVersion: "", currentWorld: null, roles: []});
		await unitOfWork.userRepository.create(this.tester2);
		this.tester2SecurityContext = await this.securityContextFactory.create(this.tester2);

		this.mockSessionContextFactory.setCurrentUser(this.currentUser);

		const worldService = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		this.world = await worldService.createWorld("Earth", false, this.tester1SecurityContext, unitOfWork);
		this.testRole = await this.authorizationService.createRole(
			this.tester1SecurityContext,
			this.world._id,
			"other role",
			unitOfWork
		);
		await this.wikiFolderService.createFolder(
			this.tester1SecurityContext,
			"new folder",
			this.world.rootFolder,
			unitOfWork
		);
		this.newFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("name", "new folder"),
			new FilterCondition("world", this.world._id),
		]);
		await this.wikiPageService.createWiki(this.tester1SecurityContext, "new page", this.newFolder._id, unitOfWork);
		await this.wikiPageService.createWiki(
			this.tester1SecurityContext,
			"other page",
			this.world.rootFolder,
			unitOfWork
		);
		this.otherPage = await unitOfWork.wikiPageRepository.findOne([
			new FilterCondition("name", "other page"),
			new FilterCondition("world", this.world._id),
		]);
		await worldService.createPin(
			this.tester1SecurityContext,
			this.world.wikiPage,
			this.otherPage._id,
			0,
			0,
			unitOfWork
		);
		this.pin = await unitOfWork.pinRepository.findOne([
			new FilterCondition("map", this.world.wikiPage),
			new FilterCondition("page", this.otherPage._id),
		]);
		await unitOfWork.commit();
		return this;
	};

}
