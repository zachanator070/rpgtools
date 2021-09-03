import fs from "fs";
import { defaultTestingContextFactory } from "../../DefaultTestingContextFactory";
import { FileUpload, Upload } from "graphql-upload";
import { CREATE_IMAGE } from "../../../../../common/src/mutations";

process.env.TEST_SUITE = "image-mutations-test";

describe("image-mutations", () => {
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

	describe("with existing world and logged in user", () => {
		const filename = "tests/integration/resolvers/mutations/testmap.png";
		let testFile: FileUpload = {
			encoding: "base64",
			mimetype: "image/png",
			filename: filename,
			createReadStream: () => fs.createReadStream(filename),
		};
		const testUpload = new Upload();
		testUpload.resolve(testFile);

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

		test("create image no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: CREATE_IMAGE,
				variables: {
					file: testUpload,
					worldId: world._id.toString(),
					chunkify: true,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					createImage: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		describe("with unauthenticated user", () => {
			test("create image no permission", async () => {
				const result = await server.executeGraphQLQuery({
					query: CREATE_IMAGE,
					variables: {
						file: testUpload,
						worldId: world._id.toString(),
						chunkify: true,
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						createImage: {
							_id: expect.any(String),
						},
					},
					errors: undefined,
				});
			});
		});
	});
});
