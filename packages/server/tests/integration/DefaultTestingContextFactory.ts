import { TestingContext } from "./types";
import { FilterCondition } from "../../src/dal/filter-condition";
import { container } from "../../src/inversify.config";
import {
	AuthorizationService,
	RoleRepository,
	SessionContextFactory,
	UserFactory,
	UserRepository,
	WikiFolderRepository,
	WikiFolderService,
	WikiPageService,
	WorldService,
} from "../../src/types";
import { INJECTABLE_TYPES } from "../../src/injectable-types";
import { SecurityContextFactory } from "../../src/security-context-factory";
import { MockSessionContextFactory } from "./MockSessionContextFactory";
import { ExpressApiServer } from "../../src/express-api-server";
import { createTestClient } from "apollo-server-testing";

export const defaultTestingContextFactory = (): TestingContext => {
	container
		.rebind<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory)
		.to(MockSessionContextFactory)
		.inSingletonScope();

	const server: ExpressApiServer = container.get<ExpressApiServer>(INJECTABLE_TYPES.ApiServer);

	const { mutate, query } = createTestClient(server.gqlServer);

	const mockSessionContextFactory = container.get<MockSessionContextFactory>(
		INJECTABLE_TYPES.SessionContextFactory
	);
	const userRepo = container.get<UserRepository>(INJECTABLE_TYPES.UserRepository);
	const wikiFolderRepo = container.get<WikiFolderRepository>(INJECTABLE_TYPES.WikiFolderRepository);
	const securityContextFactory = container.get<SecurityContextFactory>(
		INJECTABLE_TYPES.SecurityContextFactory
	);
	const roleRepo = container.get<RoleRepository>(INJECTABLE_TYPES.RoleRepository);
	const authorizationService = container.get<AuthorizationService>(
		INJECTABLE_TYPES.AuthorizationService
	);
	const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
	const wikiPageService = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
	const userFactory = container.get<UserFactory>(INJECTABLE_TYPES.UserFactory);
	return {
		mockSessionContextFactory,
		mutate,
		query,
		server,
		otherUser: null,
		otherUserSecurityContext: null,
		world: null,
		testRole: null,
		currentUser: null,
		testerSecurityContext: null,
		newFolder: null,
		async reset() {
			this.mockSessionContextFactory = mockSessionContextFactory;
			this.currentUser = await userRepo.findOne([new FilterCondition("username", "tester")]);
			this.otherUser = userFactory(null, "tester2@gmail.com", "tester2", "", "", null, [], []);
			this.testerSecurityContext = await securityContextFactory.create(this.currentUser);
			this.otherUserSecurityContext = await securityContextFactory.create(this.otherUser);
			this.mockSessionContextFactory.setCurrentUser(this.currentUser);
			await userRepo.create(this.otherUser);
			const worldService = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
			this.world = await worldService.createWorld("Earth", false, this.testerSecurityContext);
			await authorizationService.createRole(
				this.testerSecurityContext,
				this.world._id,
				"other role"
			);
			this.testRole = await roleRepo.findOne([
				new FilterCondition("name", "other role"),
				new FilterCondition("world", this.world._id),
			]);
			await wikiFolderService.createFolder(
				this.testerSecurityContext,
				"new folder",
				this.world.rootFolder
			);
			this.newFolder = await wikiFolderRepo.findOne([
				new FilterCondition("name", "new folder"),
				new FilterCondition("world", this.world._id),
			]);
			await wikiPageService.createWiki(this.testerSecurityContext, "new page", this.newFolder._id);
			return this;
		},
	};
};
