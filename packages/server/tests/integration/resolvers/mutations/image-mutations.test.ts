import fs from "fs";
import { FileUpload, Upload } from "graphql-upload";
import {CREATE_IMAGE} from "@rpgtools/common/src/gql-mutations";
import {container} from "../../../../src/di/inversify.js";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types.js";
import {DefaultTestingContext} from "../../default-testing-context.js";

process.env.TEST_SUITE = "image-mutations-test";

describe("image-mutations", () => {

	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

	describe("with existing world and logged in user", () => {

		const filename = "tests/integration/resolvers/mutations/testmap.png";
		let testFile: FileUpload = {
			encoding: "base64",
			mimetype: "image/png",
			filename: filename,
			createReadStream: () => fs.createReadStream(filename),
		};
		const testUpload = new Upload();
		testUpload.file = testFile;
		testUpload.promise = new Promise<FileUpload>((resolve, reject) => {
			resolve(testFile);
		});

		beforeEach(async () => {
			await testingContext.reset();
		});

		test("create image no permission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_IMAGE,
				variables: {
					file: testUpload,
					worldId: testingContext.world._id.toString(),
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
				const result = await testingContext.server.executeGraphQLQuery({
					query: CREATE_IMAGE,
					variables: {
						file: testUpload,
						worldId: testingContext.world._id.toString(),
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
