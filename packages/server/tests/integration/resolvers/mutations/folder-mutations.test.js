import { User } from "../../../../src/dal/mongodb/models/user";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "../../../../src/gql-server-schema";
import { allResolvers } from "../../../../src/resolvers/all-resolvers";
import { createTestClient } from "apollo-server-testing";
import { createWorld } from "../../../../src/resolvers/mutations/world-mutations";
import { WikiFolder } from "../../../../src/dal/mongodb/models/wiki-folder";
import { WikiPageModel } from "../../../../src/dal/mongodb/models/wiki-page";
import { ARTICLE, WIKI_FOLDER } from "../../../../../common/src/type-constants";
import { PermissionAssignment } from "../../../../src/dal/mongodb/models/permission-assignment";
import { ANON_USERNAME, WIKI_RW } from "../../../../../common/src/permission-constants";
import { CREATE_FOLDER } from "../../../../../frontend/src/hooks/wiki/useCreateFolder";
import { DELETE_FOLDER } from "../../../../../frontend/src/hooks/wiki/useDeleteFolder";
import { RENAME_FOLDER } from "../../../../../frontend/src/hooks/wiki/useRenameFolder";

process.env.TEST_SUITE = "folder-mutations-test";

describe("folder-mutations", () => {
	let currentUser = new User({ username: ANON_USERNAME });

	const server = new ApolloServer({
		typeDefs,
		resolvers: allResolvers,
		context: () => {
			return {
				currentUser: currentUser,
				res: {
					cookie: () => {},
				},
			};
		},
	});

	const { mutate } = createTestClient(server);

	describe("with existing world", () => {
		let world = null;
		let newFolder = null;

		beforeEach(async () => {
			const user = await User.findOne({ username: "tester" });
			await user.recalculateAllPermissions();
			world = await createWorld("Earth", false, user);
			const rootFolder = await WikiFolder.findById(world.rootFolder);
			newFolder = await WikiFolder.create({
				name: "new folder",
				world: world._id,
			});
			rootFolder.children.push(newFolder);
			await rootFolder.save();
		});

		describe("with unauthenticated user", () => {
			test("create folder permission denied", async () => {
				const result = await mutate({
					mutation: CREATE_FOLDER,
					variables: {
						name: "new folder",
						parentFolderId: world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot();
			});

			test("rename folder permission denied", async () => {
				const result = await mutate({
					mutation: RENAME_FOLDER,
					variables: {
						name: "new folder",
						folderId: world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot();
			});

			test("delete folder permission denied", async () => {
				const result = await mutate({
					mutation: DELETE_FOLDER,
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

		describe("with authenticated user", () => {
			beforeEach(async () => {
				currentUser = await User.findOne({ username: "tester" }).populate({
					path: "roles permissions",
					populate: { path: "permissions" },
				});
				await currentUser.recalculateAllPermissions();
			});

			test("create folder", async () => {
				const result = await mutate({
					mutation: CREATE_FOLDER,
					variables: {
						name: "new folder",
						parentFolderId: world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						createFolder: {
							_id: expect.any(String),
							folders: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									children: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
										}),
									]),
								}),
							]),
						},
					},
				});
			});

			test("rename folder", async () => {
				const result = await mutate({
					mutation: RENAME_FOLDER,
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
				const result = await mutate({
					mutation: DELETE_FOLDER,
					variables: { folderId: newFolder._id.toString() },
				});
				expect(result).toMatchSnapshot({
					data: {
						deleteFolder: {
							_id: expect.any(String),
							folders: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									children: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
										}),
									]),
								}),
							]),
						},
					},
				});
			});

			test("delete root folder", async () => {
				const result = await mutate({
					mutation: DELETE_FOLDER,
					variables: { folderId: world.rootFolder.toString() },
				});
				expect(result).toMatchSnapshot();
			});
		});

		describe("with third user", () => {
			let otherUser = null;

			beforeEach(async () => {
				otherUser = await User.create({ username: "tester2" });
				const childPage = await WikiPageModel.create({
					name: "page",
					type: ARTICLE,
					world: world,
				});
				newFolder.pages.push(childPage);
				await newFolder.save();
				const assignment = await PermissionAssignment.create({
					permission: WIKI_RW,
					subject: newFolder,
					subjectType: WIKI_FOLDER,
				});
				otherUser.permissions.push(assignment);
				await otherUser.save();
			});

			test("no permission to child", async () => {
				const result = await mutate({
					mutation: DELETE_FOLDER,
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
