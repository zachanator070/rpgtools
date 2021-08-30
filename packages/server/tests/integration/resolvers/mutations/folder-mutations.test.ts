import { WIKI_FOLDER } from "../../../../../common/src/type-constants";
import { WIKI_RW } from "../../../../../common/src/permission-constants";
import { CREATE_FOLDER } from "../../../../../frontend/src/hooks/wiki/useCreateFolder";
import { DELETE_FOLDER } from "../../../../../frontend/src/hooks/wiki/useDeleteFolder";
import { RENAME_FOLDER } from "../../../../../frontend/src/hooks/wiki/useRenameFolder";
import { container } from "../../../../src/inversify";
import { AuthorizationService, WikiPageService } from "../../../../src/types";
import { INJECTABLE_TYPES } from "../../../../src/injectable-types";
import { defaultTestingContextFactory } from "../../DefaultTestingContextFactory";

process.env.TEST_SUITE = "folder-mutations-test";

describe("folder-mutations", () => {
	let {
		server,
		mockSessionContextFactory,
		otherUser,
		otherUserSecurityContext,
		world,
		testRole,
		currentUser,
		testerSecurityContext,
		newFolder,
		...testingContext
	} = defaultTestingContextFactory();

	const authorizationService = container.get<AuthorizationService>(
		INJECTABLE_TYPES.AuthorizationService
	);
	const wikiPageService = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);

	describe("with tester logged in and world created", () => {
		beforeEach(async () => {
			({
				mockSessionContextFactory,
				otherUser,
				otherUserSecurityContext,
				world,
				testRole,
				currentUser,
				testerSecurityContext,
				newFolder,
			} = await testingContext.reset());
		});

		test("create folder", async () => {
			const result = await server.executeGraphQLQuery({
				query: CREATE_FOLDER,
				variables: {
					name: "new folder",
					parentFolderId: world.rootFolder.toString(),
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
			const result = await server.executeGraphQLQuery({
				query: RENAME_FOLDER,
				variables: {
					name: "new folder",
					folderId: world.rootFolder.toString(),
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
			const result = await server.executeGraphQLQuery({
				query: DELETE_FOLDER,
				variables: { folderId: newFolder._id.toString() },
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
			const result = await server.executeGraphQLQuery({
				query: DELETE_FOLDER,
				variables: { folderId: world.rootFolder.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		describe("with unauthenticated user", () => {
			beforeEach(async () => {
				mockSessionContextFactory.resetCurrentUser();
			});

			test("create folder permission denied", async () => {
				const result = await server.executeGraphQLQuery({
					query: CREATE_FOLDER,
					variables: {
						name: "new folder",
						parentFolderId: world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot();
			});

			test("rename folder permission denied", async () => {
				const result = await server.executeGraphQLQuery({
					query: RENAME_FOLDER,
					variables: {
						name: "new folder",
						folderId: world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot();
			});

			test("delete folder permission denied", async () => {
				const result = await server.executeGraphQLQuery({
					query: DELETE_FOLDER,
					variables: { folderId: newFolder._id.toString() },
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
				mockSessionContextFactory.setCurrentUser(otherUser);
				await wikiPageService.createWiki(testerSecurityContext, "new page", newFolder._id);
				await authorizationService.grantUserPermission(
					testerSecurityContext,
					WIKI_RW,
					newFolder._id,
					WIKI_FOLDER,
					otherUser._id
				);
			});

			test("no permission to child", async () => {
				const result = await server.executeGraphQLQuery({
					query: DELETE_FOLDER,
					variables: { folderId: newFolder._id.toString() },
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
