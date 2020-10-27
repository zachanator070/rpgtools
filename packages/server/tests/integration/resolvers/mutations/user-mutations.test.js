import { User } from "../../../../src/models/user";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "../../../../src/gql-server-schema";
import { serverResolvers } from "../../../../src/resolvers/server-resolvers";
import { createTestClient } from "apollo-server-testing";
import { World } from "../../../../src/models/world";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants";
import { SET_CURRENT_WORLD } from "../../../../../app/src/hooks/world/useSetCurrentWorld";

process.env.TEST_SUITE = "user-mutations-test";

describe("user mutations", () => {
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

	describe("with world", () => {
		let world = null;

		beforeEach(async () => {
			world = await World.create({ name: "a whole new world" });
		});

		test("set current world not logged in", async () => {
			const result = await mutate({
				mutation: SET_CURRENT_WORLD,
				variables: { worldId: world._id.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		describe("with authenticated user", () => {
			beforeEach(async () => {
				currentUser = await User.findOne({ username: "tester" });
			});

			test("set current world", async () => {
				const result = await mutate({
					mutation: SET_CURRENT_WORLD,
					variables: { worldId: world._id.toString() },
				});
				expect(result).toMatchSnapshot({
					data: {
						setCurrentWorld: {
							_id: expect.any(String),
						},
					},
				});
			});
		});
	});
});
