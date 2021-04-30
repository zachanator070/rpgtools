import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "../../../../src/gql-server-schema";
import { serverResolvers } from "../../../../src/resolvers/server-resolvers";
import { User } from "../../../../src/models/user";
import { createTestClient } from "apollo-server-testing";
import { Pin } from "../../../../src/models/pin";
import { World } from "../../../../src/models/world";
import { Article } from "../../../../src/models/article";
import { createWorld } from "../../../../src/resolvers/mutations/world-mutations";
import { ANON_USERNAME } from "../../../../../common/src/permission-constants";
import { CREATE_PIN } from "../../../../../frontend/src/hooks/map/useCreatePin";
import { CREATE_WORLD } from "../../../../../frontend/src/hooks/world/useCreateWorld";
import { DELETE_PIN } from "../../../../../frontend/src/hooks/map/useDeletePin";
import { RENAME_WORLD } from "../../../../../frontend/src/hooks/world/useRenameWorld";
import { UPDATE_PIN } from "../../../../../frontend/src/hooks/map/useUpdatePin";

process.env.TEST_SUITE = "world-mutations-test";

describe("world-mutations", () => {
	let currentUser = new User({ username: ANON_USERNAME });

	const server = new ApolloServer({
		typeDefs,
		resolvers: serverResolvers,
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

	test("create world", async () => {
		currentUser = await User.findOne({ username: "tester" });
		await currentUser.recalculateAllPermissions();
		const result = await mutate({
			mutation: CREATE_WORLD,
			variables: { name: "Earth", public: false },
		});
		expect(result).toMatchSnapshot({
			data: {
				createWorld: {
					_id: expect.any(String),
					wikiPage: {
						_id: expect.any(String),
					},
				},
			},
		});
	});

	test("create world no permissions", async () => {
		const result = await mutate({
			mutation: CREATE_WORLD,
			variables: { name: "Earth", public: false },
		});
		expect(result).toMatchSnapshot();
	});

	describe("needs existing world", () => {
		let world = null;

		beforeEach(async () => {
			currentUser = await User.findOne({ username: "tester" });
			await currentUser.recalculateAllPermissions();
			world = await createWorld("Earth", false, currentUser);
		});

		test("rename world", async () => {
			const result = await mutate({
				mutation: RENAME_WORLD,
				variables: { worldId: world._id.toString(), newName: "Azeroth" },
			});
			expect(result).toMatchSnapshot({
				data: {
					renameWorld: {
						_id: expect.any(String),
					},
				},
			});
		});

		test("rename world no permission", async () => {
			currentUser = new User({ username: ANON_USERNAME });
			await currentUser.recalculateAllPermissions();
			const result = await mutate({
				mutation: RENAME_WORLD,
				variables: { worldId: world._id.toString(), newName: "Azeroth" },
			});
			expect(result).toMatchSnapshot();
		});

		test("create pin", async () => {
			const result = await mutate({
				mutation: CREATE_PIN,
				variables: {
					mapId: world.wikiPage._id.toString(),
					x: 0,
					y: 0,
					wikiId: world.wikiPage._id.toString(),
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					createPin: {
						_id: expect.any(String),
						pins: [
							{
								_id: expect.any(String),
								map: {
									_id: expect.any(String),
								},
								page: {
									_id: expect.any(String),
								},
							},
						],
					},
				},
			});
		});

		test("create pin no permission", async () => {
			currentUser = new User({ username: ANON_USERNAME });
			await currentUser.recalculateAllPermissions();
			const result = await mutate({
				mutation: CREATE_PIN,
				variables: {
					mapId: world.wikiPage._id.toString(),
					x: 0,
					y: 0,
					wikiId: world.wikiPage._id.toString(),
				},
			});
			expect(result).toMatchSnapshot();
		});

		describe("needs existing pin", () => {
			let page = null;
			let pin = null;

			beforeEach(async () => {
				page = await Article.create({ name: "other place", world: world._id });
				pin = await Pin.create({ x: 0, y: 0, map: world.wikiPage._id });
				const worldDoc = await World.findById(world._id);
				worldDoc.pins = [pin];
				await worldDoc.save();
			});

			test("update pin", async () => {
				const result = await mutate({
					mutation: UPDATE_PIN,
					variables: { pinId: pin._id.toString(), pageId: page._id.toString() },
				});
				expect(result).toMatchSnapshot({
					data: {
						updatePin: {
							_id: expect.any(String),
							pins: [
								{
									_id: expect.any(String),
									map: {
										_id: expect.any(String),
									},
									page: {
										_id: expect.any(String),
									},
								},
							],
						},
					},
				});
			});

			test("update pin no permission", async () => {
				currentUser = new User({ username: ANON_USERNAME });
				await currentUser.recalculateAllPermissions();
				const result = await mutate({
					mutation: UPDATE_PIN,
					variables: { pinId: pin._id.toString(), pageId: page._id.toString() },
				});
				expect(result).toMatchSnapshot();
			});

			test("delete pin", async () => {
				const result = await mutate({
					mutation: DELETE_PIN,
					variables: { pinId: pin._id.toString() },
				});
				expect(result).toMatchSnapshot({
					data: {
						deletePin: {
							_id: expect.any(String),
						},
					},
				});
			});

			test("delete pin no permission", async () => {
				currentUser = new User({ username: ANON_USERNAME });
				await currentUser.recalculateAllPermissions();
				const result = await mutate({
					mutation: DELETE_PIN,
					variables: { pinId: pin._id.toString() },
				});
				expect(result).toMatchSnapshot();
			});
		});
	});
});
