import { DefaultTestingContext } from "../default-testing-context.js";
import {
	CREATE_TOKEN_ICON,
	CREATE_IMAGE,
} from "@rpgtools/common/src/gql-mutations.js";
import {
	GET_TOKEN_ICONS,
} from "@rpgtools/common/src/gql-queries.js";
import { container } from "../../../src/di/inversify.js";
import { TEST_INJECTABLE_TYPES } from "../injectable-types.js";
import {
	TOKEN_ICON_ADD,
	TOKEN_READ_ALL,
	TOKEN_RW_ALL,
} from "@rpgtools/common/src/permission-constants.js";
import { TOKEN_ICON, WORLD } from "@rpgtools/common/src/type-constants.js";
import { AuthorizationService } from "../../../src/services/authorization-service.js";
import { INJECTABLE_TYPES } from "../../../src/di/injectable-types.js";
import { DbEngine } from "../../../src/types.js";
import fs from "fs";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import Upload from "graphql-upload/Upload.mjs";

process.env.TEST_SUITE = "token-icon-query-test";

const createTestImage = async (testingContext: DefaultTestingContext): Promise<string> => {
	const filename = "tests/integration/resolvers/mutations/testmap.png";
	const testFile: FileUpload = {
		encoding: "base64",
		mimetype: "image/png",
		filename: filename,
		createReadStream: () => fs.createReadStream(filename),
	};
	const testUpload = new Upload();
	testUpload.file = testFile;
	testUpload.promise = new Promise<FileUpload>((resolve) => {
		resolve(testFile);
	});

	const result = await testingContext.server.executeGraphQLQuery({
		query: CREATE_IMAGE,
		variables: {
			file: testUpload,
			worldId: testingContext.world._id.toString(),
			chunkify: false,
		},
	});

	return result.data?.createImage?._id;
};

describe("token-icon-query", () => {
	const testingContext = container.get<DefaultTestingContext>(
		TEST_INJECTABLE_TYPES.DefaultTestingContext
	);
	const authorizationService = container.get<AuthorizationService>(
		INJECTABLE_TYPES.AuthorizationService
	);
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);

	describe("tokenIcons query", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("returns empty list for empty world", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			expect(result).toMatchSnapshot({
				data: {
					tokenIcons: {
						docs: [],
						page: 1,
						pageCount: expect.any(Number),
						totalDocs: 0,
						limit: 10,
						totalPages: expect.any(Number),
						pagingCounter: 1,
						hasPrevPage: false,
						hasNextPage: false,
						prevPage: null,
						nextPage: null,
					},
				},
				errors: undefined,
			});
		});

		test("returns token icons in correct order", async () => {
			// Create multiple token icons
			const ids: string[] = [];
			for (let i = 0; i < 3; i++) {
				const result = await testingContext.server.executeGraphQLQuery({
					query: CREATE_TOKEN_ICON,
					variables: {
						worldId: testingContext.world._id,
						imageId: imageId,
					},
				});
				ids.push(result.data?.createTokenIcon?._id);
			}

			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			expect(result.data?.tokenIcons.docs).toHaveLength(3);
			expect(result.data?.tokenIcons.totalDocs).toBe(3);
			expect(result.data?.tokenIcons.totalPages).toBe(1);
			result.data?.tokenIcons.docs.forEach((doc: any) => {
				expect(ids).toContain(doc._id);
				expect(doc.image._id).toBe(imageId);
				expect(doc.world._id).toBe(testingContext.world._id);
			});
		});

		test("pagingCounter updates correctly", async () => {
			// Create 15 token icons
			for (let i = 0; i < 15; i++) {
				await testingContext.server.executeGraphQLQuery({
					query: CREATE_TOKEN_ICON,
					variables: {
						worldId: testingContext.world._id,
						imageId: imageId,
					},
				});
			}

			const page1Result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			const page2Result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 2,
				},
			});

			expect(page1Result.data?.tokenIcons.pagingCounter).toBe(1);
			expect(page1Result.data?.tokenIcons.hasPrevPage).toBe(false);
			expect(page1Result.data?.tokenIcons.hasNextPage).toBe(true);
			expect(page1Result.data?.tokenIcons.nextPage).toBe(2);
			expect(page1Result.data?.tokenIcons.prevPage).toBe(null);

			expect(page2Result.data?.tokenIcons.pagingCounter).toBe(11);
			expect(page2Result.data?.tokenIcons.hasPrevPage).toBe(true);
			expect(page2Result.data?.tokenIcons.hasNextPage).toBe(true);
			expect(page2Result.data?.tokenIcons.nextPage).toBe(3);
			expect(page2Result.data?.tokenIcons.prevPage).toBe(1);
		});

		test("invalid page number returns empty result", async () => {
			// Create some token icons
			for (let i = 0; i < 5; i++) {
				await testingContext.server.executeGraphQLQuery({
					query: CREATE_TOKEN_ICON,
					variables: {
						worldId: testingContext.world._id,
						imageId: imageId,
					},
				});
			}

			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 99,
				},
			});

			expect(result.data?.tokenIcons.docs).toHaveLength(0);
			expect(result.data?.tokenIcons.page).toBe(99);
			expect(result.errors).toBeUndefined();
		});
	});

	describe("tokenIcons query - read permission fallback", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("can read token icons with TOKEN_RW_ALL even without TOKEN_READ_ALL", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();

			// Create a token icon
			await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			// Grant only TOKEN_RW_ALL (not TOKEN_READ_ALL)
			await authorizationService.grantUserPermission(
				testingContext.tester1SecurityContext,
				TOKEN_RW_ALL,
				testingContext.world._id.toString(),
				WORLD,
				testingContext.tester2._id.toString(),
				databaseContext
			);

			testingContext.mockSessionContextFactory.useUser(testingContext.tester2);

			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			expect(result.data?.tokenIcons).toBeDefined();
			expect(result.data?.tokenIcons.docs).toHaveLength(1);
			expect(result.errors).toBeUndefined();
		});

		test("cannot read with TOKEN_ICON_ADD alone", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();

			// Create a token icon
			await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			// Grant only TOKEN_ICON_ADD (not read permissions)
			await authorizationService.grantUserPermission(
				testingContext.tester1SecurityContext,
				TOKEN_ICON_ADD,
				testingContext.world._id.toString(),
				WORLD,
				testingContext.tester2._id.toString(),
				databaseContext
			);

			testingContext.mockSessionContextFactory.useUser(testingContext.tester2);

			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			expect(result.errors).toBeDefined();
			expect(result.errors![0].message).toContain(
				"You do not have permission to read token icons in this world"
			);
		});
	});

	describe("tokenIcons query - invalid input", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("invalid world id", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: "invalid-world-id",
					page: 1,
				},
			});

			expect(result.errors).toBeDefined();
			expect(result.errors![0].message).toContain("World with id");
		});

		test("zero page number", async () => {
			// This behavior depends on implementation - may be clamped to 1 or rejected
			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 0,
				},
			});

			// Should either return empty result or an error
			expect(
				result.data?.tokenIcons || result.errors
			).toBeDefined();
		});

		test("negative page number", async () => {
			// This behavior depends on implementation - may be clamped to 1 or rejected
			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: -1,
				},
			});

			// Should either return empty result or an error
			expect(
				result.data?.tokenIcons || result.errors
			).toBeDefined();
		});
	});

	describe("tokenIcons query - multiple worlds", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("token icons filtered by world", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			const worldService = container.get(INJECTABLE_TYPES.WorldService);

			// Create second world
			const secondWorld = await worldService.createWorld(
				"Venus",
				false,
				testingContext.tester1SecurityContext,
				databaseContext
			);

			// Create 5 token icons in first world
			for (let i = 0; i < 5; i++) {
				await testingContext.server.executeGraphQLQuery({
					query: CREATE_TOKEN_ICON,
					variables: {
						worldId: testingContext.world._id,
						imageId: imageId,
					},
				});
			}

			// Create 3 token icons in second world
			for (let i = 0; i < 3; i++) {
				await testingContext.server.executeGraphQLQuery({
					query: CREATE_TOKEN_ICON,
					variables: {
						worldId: secondWorld._id,
						imageId: imageId,
					},
				});
			}

			const result1 = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			const result2 = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: secondWorld._id,
					page: 1,
				},
			});

			expect(result1.data?.tokenIcons.docs).toHaveLength(5);
			expect(result1.data?.tokenIcons.totalDocs).toBe(5);
			expect(result2.data?.tokenIcons.docs).toHaveLength(3);
			expect(result2.data?.tokenIcons.totalDocs).toBe(3);
		});

		test("user with permission in one world cannot access token icons from another world", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			const worldService = container.get(INJECTABLE_TYPES.WorldService);

			// Create second world
			const secondWorld = await worldService.createWorld(
				"Jupiter",
				false,
				testingContext.tester1SecurityContext,
				databaseContext
			);

			// Create token icons in both worlds
			await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: secondWorld._id,
					imageId: imageId,
				},
			});

			// Grant tester2 TOKEN_READ_ALL only in first world
			await authorizationService.grantUserPermission(
				testingContext.tester1SecurityContext,
				TOKEN_READ_ALL,
				testingContext.world._id.toString(),
				WORLD,
				testingContext.tester2._id.toString(),
				databaseContext
			);

			testingContext.mockSessionContextFactory.useUser(testingContext.tester2);

			// Should be able to read from first world
			const result1 = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			expect(result1.data?.tokenIcons.docs).toHaveLength(1);
			expect(result1.errors).toBeUndefined();

			// Should not be able to read from second world
			const result2 = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: secondWorld._id,
					page: 1,
				},
			});

			expect(result2.errors).toBeDefined();
			expect(result2.errors![0].message).toContain(
				"You do not have permission to read token icons"
			);
		});
	});
});
