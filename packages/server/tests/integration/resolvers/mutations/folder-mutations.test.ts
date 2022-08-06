import { WIKI_FOLDER } from "@rpgtools/common/src/type-constants";
import { WIKI_RW } from "@rpgtools/common/src/permission-constants";
import { container } from "../../../../src/di/inversify";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types";
import {CREATE_FOLDER, DELETE_FOLDER, RENAME_FOLDER} from "@rpgtools/common/src/gql-mutations";
import {AuthorizationService} from "../../../../src/services/authorization-service";
import {WikiPageService} from "../../../../src/services/wiki-page-service";
import {Factory} from "../../../../src/types";
import {DbUnitOfWork} from "../../../../src/dal/db-unit-of-work";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";
import {DefaultTestingContext} from "../../default-testing-context";

process.env.TEST_SUITE = "folder-mutations-test";

describe("folder-mutations", () => {

	const unitOfWorkFactory = container.get<Factory<DbUnitOfWork>>(INJECTABLE_TYPES.DbUnitOfWorkFactory);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

	const authorizationService = container.get<AuthorizationService>(
		INJECTABLE_TYPES.AuthorizationService
	);
	const wikiPageService = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);

	describe("with tester logged in and world created", () => {
		beforeEach(async () => {
			await testingContext.reset();
		});

		test("create folder", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_FOLDER,
				variables: {
					name: "new folder",
					parentFolderId: testingContext.world.rootFolder.toString(),
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					createFolder: {
						_id: expect.any(String),
					},
				},
			});
		});

		test("rename folder", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: RENAME_FOLDER,
				variables: {
					name: "new folder",
					folderId: testingContext.world.rootFolder.toString(),
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					renameFolder: {
						_id: expect.any(String),
					},
				},
			});
		});

		test("delete folder", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: DELETE_FOLDER,
				variables: { folderId: testingContext.newFolder._id.toString() },
			});
			expect(result).toMatchSnapshot({
				data: {
					deleteFolder: {
						_id: expect.any(String),
					},
				},
			});
		});

		test("delete root folder", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: DELETE_FOLDER,
				variables: { folderId: testingContext.world.rootFolder.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		describe("with unauthenticated user", () => {
			beforeEach(async () => {
				testingContext.mockSessionContextFactory.resetCurrentUser();
			});

			test("create folder permission denied", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: CREATE_FOLDER,
					variables: {
						name: "new folder",
						parentFolderId: testingContext.world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot();
			});

			test("rename folder permission denied", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: RENAME_FOLDER,
					variables: {
						name: "new folder",
						folderId: testingContext.world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot();
			});

			test("delete folder permission denied", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: DELETE_FOLDER,
					variables: { folderId: testingContext.newFolder._id.toString() },
				});
				expect(result).toMatchSnapshot({
					errors: [
						{
							message: expect.any(String),
						},
					],
				});
			});
		});

		describe("as other user", () => {
			beforeEach(async () => {
				await testingContext.reset();
				testingContext.mockSessionContextFactory.setCurrentUser(testingContext.otherUser);
				const unitOfWork = unitOfWorkFactory({});
				await wikiPageService.createWiki(testingContext.testerSecurityContext, "new page", testingContext.newFolder._id, unitOfWork);
				await authorizationService.grantUserPermission(
					testingContext.testerSecurityContext,
					WIKI_RW,
					testingContext.newFolder._id,
					WIKI_FOLDER,
					testingContext.otherUser._id,
					unitOfWork
				);
				await unitOfWork.commit();
				testingContext.mockSessionContextFactory.setCurrentUser(testingContext.otherUser);
			});

			test("no permission to child", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: DELETE_FOLDER,
					variables: { folderId: testingContext.newFolder._id.toString() },
				});
				expect(result).toMatchSnapshot({
					errors: [
						{
							message: expect.any(String),
						},
					],
				});
			});
		});
	});
});
