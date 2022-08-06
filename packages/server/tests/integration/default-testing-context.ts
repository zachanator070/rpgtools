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

	otherUser: User;
	otherUserSecurityContext: SecurityContext;
	world: World;
	testRole: Role;
	currentUser: User;
	testerSecurityContext: SecurityContext;
	newFolder: WikiFolder;
	otherPage: WikiPage;
	pin: Pin;

	async reset() {
		const unitOfWork = this.unitOfWorkFactory({});
		this.currentUser = await unitOfWork.userRepository.findOne([new FilterCondition("username", "tester")]);
		this.otherUser = this.userFactory({_id: null, email: "tester2@gmail.com", username: "tester2", password: "", tokenVersion: "", currentWorld: null, roles: [], permissions: []});
		await unitOfWork.userRepository.create(this.otherUser);
		this.testerSecurityContext = await this.securityContextFactory.create(this.currentUser);
		this.otherUserSecurityContext = await this.securityContextFactory.create(this.otherUser);
		this.mockSessionContextFactory.setCurrentUser(this.currentUser);
		const worldService = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		this.world = await worldService.createWorld("Earth", false, this.testerSecurityContext, unitOfWork);
		await this.authorizationService.createRole(
			this.testerSecurityContext,
			this.world._id,
			"other role",
			unitOfWork
		);
		this.testRole = await unitOfWork.roleRepository.findOne([
			new FilterCondition("name", "other role"),
			new FilterCondition("world", this.world._id),
		]);
		await this.wikiFolderService.createFolder(
			this.testerSecurityContext,
			"new folder",
			this.world.rootFolder,
			unitOfWork
		);
		this.newFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("name", "new folder"),
			new FilterCondition("world", this.world._id),
		]);
		await this.wikiPageService.createWiki(this.testerSecurityContext, "new page", this.newFolder._id, unitOfWork);
		await this.wikiPageService.createWiki(
			this.testerSecurityContext,
			"other page",
			this.world.rootFolder,
			unitOfWork
		);
		this.otherPage = await unitOfWork.wikiPageRepository.findOne([
			new FilterCondition("name", "other page"),
			new FilterCondition("world", this.world._id),
		]);
		await worldService.createPin(
			this.testerSecurityContext,
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
