import { DefaultTestingContext } from "../../default-testing-context.js";
import {
	CREATE_TOKEN_ICON,
	DELETE_TOKEN_ICON,
	CREATE_IMAGE,
	BULK_CREATE_TOKEN_ICON,
} from "@rpgtools/common/src/gql-mutations.js";
import {
	GET_TOKEN_ICONS,
} from "@rpgtools/common/src/gql-queries.js";
import { container } from "../../../../src/di/inversify.js";
import { TEST_INJECTABLE_TYPES } from "../../injectable-types.js";
import {
	TOKEN_ICON_ADD,
	TOKEN_READ_ALL,
	TOKEN_RW_ALL,
} from "@rpgtools/common/src/permission-constants.js";
import { WORLD } from "@rpgtools/common/src/type-constants.js";
import { AuthorizationService } from "../../../../src/services/authorization-service.js";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types.js";
import { DbEngine } from "../../../../src/types.js";
import fs from "fs";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import Upload from "graphql-upload/Upload.mjs";
import { WorldService } from "src/services/world-service.js";

process.env.TEST_SUITE = "token-icon-mutations-test";

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

describe("token-icon-mutations", () => {
	const testingContext = container.get<DefaultTestingContext>(
		TEST_INJECTABLE_TYPES.DefaultTestingContext
	);
	const authorizationService = container.get<AuthorizationService>(
		INJECTABLE_TYPES.AuthorizationService
	);
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);

	describe("with world and logged in as world creator", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("create token icon without name defaults to image name", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});
			expect(result.errors).toBeUndefined();
			expect(result.data?.createTokenIcon?._id).toBeDefined();
			// When no custom name is provided, it defaults to the image filename
			expect(result.data?.createTokenIcon?.name).toBe("tests/integration/resolvers/mutations/testmap.png");
			expect(result.data?.createTokenIcon?.image?._id).toBe(imageId);
			expect(result.data?.createTokenIcon?.world?._id).toBe(testingContext.world._id);
		});

		test("create token icon with custom name", async () => {
			const customName = "My Dragon Token";
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
					name: customName,
				},
			});
			expect(result.errors).toBeUndefined();
			expect(result.data?.createTokenIcon?._id).toBeDefined();
			expect(result.data?.createTokenIcon?.name).toBe(customName);
			expect(result.data?.createTokenIcon?.image?._id).toBe(imageId);
			expect(result.data?.createTokenIcon?.world?._id).toBe(testingContext.world._id);
		});

		test("create token icon - invalid image", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: "invalid-image-id",
				},
			});
			expect(result.errors).toBeDefined();
			expect(
				result.errors![0].message.includes("invalid input syntax for type uuid") ||
				result.errors![0].message.includes("does not exist")
			).toBe(true);
		});

		test("create token icon - invalid world", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: "invalid-world-id",
					imageId: imageId,
				},
			});
			expect(result.errors).toBeDefined();
			expect(
				result.errors![0].message.includes("invalid input syntax for type uuid") ||
				result.errors![0].message.includes("does not exist")
			).toBe(true);
		});

		test("delete token icon", async () => {
			// First create a token icon
			const createResult = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});
			const tokenIconId = createResult.data?.createTokenIcon?._id;

			// Then delete it
			const deleteResult = await testingContext.server.executeGraphQLQuery({
				query: DELETE_TOKEN_ICON,
				variables: {
					tokenIconId,
				},
			});
			expect(deleteResult).toMatchSnapshot({
				data: {
					deleteTokenIcon: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		test("delete token icon - not found", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: DELETE_TOKEN_ICON,
				variables: {
					tokenIconId: "invalid-token-icon-id",
				},
			});
			expect(result.errors).toBeDefined();
			expect(
				result.errors![0].message.includes("invalid input syntax for type uuid") ||
				result.errors![0].message.includes("does not exist")
			).toBe(true);
		});

		test("get token icons", async () => {
			// Create multiple token icons
			const tokenIcon1 = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			const tokenIcon2 = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			expect(result.errors).toBeUndefined();
			expect(result.data?.tokenIcons).toBeDefined();
			expect(result.data?.tokenIcons.docs).toHaveLength(2);
			expect(result.data?.tokenIcons.page).toBe(1);
			expect(result.data?.tokenIcons.pagingCounter).toBeGreaterThanOrEqual(1);
		});

		test("get token icons with pagination", async () => {
			// Create multiple token icons (11 to test pagination with page limit of 10)
			for (let i = 0; i < 11; i++) {
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

			expect(page1Result.data?.tokenIcons.docs).toHaveLength(10);
			expect(page1Result.data?.tokenIcons.page).toBe(1);
			expect(page1Result.data?.tokenIcons.pagingCounter).toBe(1);

			expect(page2Result.data?.tokenIcons.docs).toHaveLength(1);
			expect(page2Result.data?.tokenIcons.page).toBe(2);
			expect(page2Result.data?.tokenIcons.pagingCounter).toBe(11);
		});

		test('upload token icon zip', async () => {
			const filename = "tests/integration/resolvers/mutations/test-icons.zip";
			assert.ok(fs.existsSync(filename), `Test zip file does not exist: ${filename}`);
			const testFile: FileUpload = {
				encoding: "binary",
				mimetype: "application/zip",
				filename: filename,
				createReadStream: () => fs.createReadStream(filename),
			};
			const testUpload = new Upload();
			testUpload.file = testFile;
			testUpload.promise = new Promise<FileUpload>((resolve) => {
				resolve(testFile);
			});

			const result = await testingContext.server.executeGraphQLQuery({
				query: BULK_CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					zipFile: testUpload,
				},
			});

			expect(result.errors).toBeUndefined();
			expect(result.data?.bulkCreateTokenIcons).toBeDefined();
			expect(result.data?.bulkCreateTokenIcons).toHaveLength(7);
			for (const tokenIcon of result.data?.bulkCreateTokenIcons) {
				expect(tokenIcon._id).toBeDefined();
				expect(tokenIcon.name).toBeDefined();
				expect(tokenIcon.image?._id).toBeDefined();
				expect(tokenIcon.world._id).toBe(testingContext.world._id);
			}
		});
	});

	describe("permission scenarios - TOKEN_ICON_ADD (create)", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("create token icon with TOKEN_ICON_ADD permission", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();

			// Grant tester2 the TOKEN_ICON_ADD permission
			await authorizationService.grantUserPermission(
				testingContext.tester1SecurityContext,
				TOKEN_ICON_ADD,
				testingContext.world._id.toString(),
				WORLD,
				testingContext.tester2._id.toString(),
				databaseContext
			);

			// Switch to tester2
			testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);

			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			expect(result.data?.createTokenIcon).toBeDefined();
			expect(result.errors).toBeUndefined();
		});

		test("create token icon without TOKEN_ICON_ADD permission", async () => {
			// Switch to tester2 who doesn't have TOKEN_ICON_ADD permission
			testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);

			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			expect(result.errors).toBeDefined();
			expect(result.errors![0].message).toContain(
				"You do not have permission to create token icons in this world"
			);
		});

		test("create token icon as anonymous user", async () => {
			testingContext.mockSessionContextFactory.useAnonUser();

			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			expect(result.errors).toBeDefined();
			expect(result.errors![0].message).toContain(
				"You do not have permission to create token icons in this world"
			);
		});
	});

	describe("permission scenarios - TOKEN_READ_ALL (read)", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("read token icons with TOKEN_READ_ALL permission", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();

			// First create a token icon
			await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			// Grant tester2 the TOKEN_READ_ALL permission
			await authorizationService.grantUserPermission(
				testingContext.tester1SecurityContext,
				TOKEN_READ_ALL,
				testingContext.world._id.toString(),
				WORLD,
				testingContext.tester2._id.toString(),
				databaseContext
			);

			// Switch to tester2
			testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);

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

		test("read token icons without TOKEN_READ_ALL permission", async () => {
			// First create a token icon
			await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			// Switch to tester2 who doesn't have TOKEN_READ_ALL permission
			testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);

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

		test("read token icons as anonymous user", async () => {
			// First create a token icon
			await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			testingContext.mockSessionContextFactory.useAnonUser();

			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			expect(result.errors).toBeDefined();
		});

		test("read token icons with TOKEN_RW_ALL permission (should be able to read)", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();

			// First create a token icon
			await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			// Grant tester2 the TOKEN_RW_ALL permission (which includes read access)
			await authorizationService.grantUserPermission(
				testingContext.tester1SecurityContext,
				TOKEN_RW_ALL,
				testingContext.world._id.toString(),
				WORLD,
				testingContext.tester2._id.toString(),
				databaseContext
			);

			// Switch to tester2
			testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);

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
	});

	describe("permission scenarios - TOKEN_RW_ALL (write/delete)", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("delete token icon with TOKEN_RW_ALL permission", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();

			// First create a token icon
			const createResult = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});
			const tokenIconId = createResult.data?.createTokenIcon?._id;

			// Grant tester2 the TOKEN_RW_ALL permission
			await authorizationService.grantUserPermission(
				testingContext.tester1SecurityContext,
				TOKEN_RW_ALL,
				testingContext.world._id.toString(),
				WORLD,
				testingContext.tester2._id.toString(),
				databaseContext
			);

			// Switch to tester2
			testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);

			const deleteResult = await testingContext.server.executeGraphQLQuery({
				query: DELETE_TOKEN_ICON,
				variables: {
					tokenIconId,
				},
			});

			expect(deleteResult.data?.deleteTokenIcon).toBeDefined();
			expect(deleteResult.errors).toBeUndefined();
		});

		test("delete token icon without TOKEN_RW_ALL permission", async () => {
			// First create a token icon
			const createResult = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});
			const tokenIconId = createResult.data?.createTokenIcon?._id;

			// Switch to tester2 who doesn't have TOKEN_RW_ALL permission
			testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);

			const deleteResult = await testingContext.server.executeGraphQLQuery({
				query: DELETE_TOKEN_ICON,
				variables: {
					tokenIconId,
				},
			});

			expect(deleteResult.errors).toBeDefined();
			expect(deleteResult.errors![0].message).toContain(
				"You do not have permission to delete this token icon"
			);
		});

		test("delete token icon as anonymous user", async () => {
			// First create a token icon
			const createResult = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});
			const tokenIconId = createResult.data?.createTokenIcon?._id;

			testingContext.mockSessionContextFactory.useAnonUser();

			const deleteResult = await testingContext.server.executeGraphQLQuery({
				query: DELETE_TOKEN_ICON,
				variables: {
					tokenIconId,
				},
			});

			expect(deleteResult.errors).toBeDefined();
		});
	});

	describe("multi-world scenarios", () => {
		let imageId: string;

		beforeEach(async () => {
			await testingContext.reset();
			imageId = await createTestImage(testingContext);
		});

		test("token icons are isolated per world", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			const worldService = container.get<WorldService>(INJECTABLE_TYPES.WorldService);

			// Create a second world
			const secondWorld = await worldService.createWorld(
				"Mars",
				false,
				testingContext.tester1SecurityContext,
				databaseContext
			);

			// Create token icons in both worlds
			const tokenIcon1 = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: testingContext.world._id,
					imageId: imageId,
				},
			});

			const tokenIcon2 = await testingContext.server.executeGraphQLQuery({
				query: CREATE_TOKEN_ICON,
				variables: {
					worldId: secondWorld._id,
					imageId: imageId,
				},
			});

			// Query token icons in first world
			const result1 = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: testingContext.world._id,
					page: 1,
				},
			});

			// Query token icons in second world
			const result2 = await testingContext.server.executeGraphQLQuery({
				query: GET_TOKEN_ICONS,
				variables: {
					worldId: secondWorld._id,
					page: 1,
				},
			});

			expect(result1.data?.tokenIcons.docs).toHaveLength(1);
			expect(result2.data?.tokenIcons.docs).toHaveLength(1);
			expect(result1.data?.tokenIcons.docs[0]._id).not.toEqual(
				result2.data?.tokenIcons.docs[0]._id
			);
		});
	});
});
