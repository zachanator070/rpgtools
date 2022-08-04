import { WIKI_READ, WIKI_RW, WORLD_READ } from "@rpgtools/common/src/permission-constants";
import { PLACE, WORLD } from "@rpgtools/common/src/type-constants";
import { container } from "../../../../src/di/inversify";
import { RoleFactory, RoleRepository } from "../../../../src/types";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types";
import { defaultTestingContextFactory } from "../../DefaultTestingContextFactory";
import {
	ADD_USER_ROLE,
	CREATE_ROLE,
	DELETE_ROLE,
	GRANT_ROLE_PERMISSION,
	GRANT_USER_PERMISSION, REMOVE_USER_ROLE, REVOKE_ROLE_PERMISSION, REVOKE_USER_PERMISSION
} from "@rpgtools/common/src/gql-mutations";
import {AuthorizationService} from "../../../../src/services/authorization-service";

process.env.TEST_SUITE = "authorization-mutations-test";

describe("authorization-mutations", () => {
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

	const roleRepo = container.get<RoleRepository>(INJECTABLE_TYPES.RoleRepository);
	const authorizationService = container.get<AuthorizationService>(
		INJECTABLE_TYPES.AuthorizationService
	);
	const roleFactory = container.get<RoleFactory>(INJECTABLE_TYPES.RoleFactory);

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

		test("grantUserPermission", async () => {
			const result = await server.executeGraphQLQuery({
				query: GRANT_USER_PERMISSION,
				variables: {
					userId: otherUser._id.toString(),
					permission: WORLD_READ,
					subjectId: world._id.toString(),
					subjectType: WORLD,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					grantUserPermission: expect.objectContaining({
						_id: expect.any(String),
						accessControlList: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
								permission: expect.any(String),
								canWrite: expect.any(Boolean),
								subject: expect.objectContaining({
									_id: expect.any(String),
									name: expect.any(String),
								}),
							}),
						]),
					}),
				},
				errors: undefined,
			});
		});

		test("grantUserPermission permission denied", async () => {
			mockSessionContextFactory.resetCurrentUser();
			const result = await server.executeGraphQLQuery({
				query: GRANT_USER_PERMISSION,
				variables: {
					userId: otherUser._id.toString(),
					permission: WORLD_READ,
					subjectId: world._id.toString(),
					subjectType: WORLD,
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("revokeUserPermission", async () => {
			await authorizationService.grantUserPermission(
				testerSecurityContext,
				WIKI_READ,
				world.wikiPage,
				PLACE,
				otherUser._id
			);
			const result = await server.executeGraphQLQuery({
				query: REVOKE_USER_PERMISSION,
				variables: {
					userId: otherUser._id.toString(),
					permission: WIKI_READ,
					subjectId: world.wikiPage,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					revokeUserPermission: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		test("revokeUserPermission permission denied", async () => {
			mockSessionContextFactory.resetCurrentUser();
			const result = await server.executeGraphQLQuery({
				query: REVOKE_USER_PERMISSION,
				variables: {
					userId: otherUser._id.toString(),
					permission: WORLD_READ,
					subjectId: world._id.toString(),
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("grantRolePermission", async () => {
			const result = await server.executeGraphQLQuery({
				query: GRANT_ROLE_PERMISSION,
				variables: {
					roleId: testRole._id,
					permission: WIKI_READ,
					subjectId: world.wikiPage,
					subjectType: PLACE,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					grantRolePermission: {
						_id: expect.any(String),
						permissions: [
							{
								_id: expect.any(String),
								subject: {
									_id: expect.any(String),
								},
							},
						],
					},
				},
				errors: undefined,
			});
		});

		test("grantRolePermission permission denied", async () => {
			mockSessionContextFactory.resetCurrentUser();
			const result = await server.executeGraphQLQuery({
				query: GRANT_ROLE_PERMISSION,
				variables: {
					roleId: testRole._id,
					permission: WIKI_READ,
					subjectId: world.wikiPage,
					subjectType: PLACE,
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("revokeRolePermission", async () => {
			await authorizationService.grantRolePermission(
				testerSecurityContext,
				WIKI_READ,
				world.wikiPage,
				PLACE,
				testRole._id
			);
			const result = await server.executeGraphQLQuery({
				query: REVOKE_ROLE_PERMISSION,
				variables: {
					roleId: testRole._id.toString(),
					permission: WIKI_READ,
					subjectId: world.wikiPage,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					revokeRolePermission: {
						_id: expect.any(String),
						permissions: [
						],
					},
				},
				errors: undefined,
			});
		});

		test("revokeRolePermission permission denied", async () => {
			mockSessionContextFactory.resetCurrentUser();
			await authorizationService.grantRolePermission(
				testerSecurityContext,
				WIKI_READ,
				world.wikiPage,
				PLACE,
				testRole._id
			);
			const result = await server.executeGraphQLQuery({
				query: REVOKE_ROLE_PERMISSION,
				variables: {
					roleId: testRole._id.toString(),
					permission: WIKI_READ,
					subjectId: world.wikiPage,
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("createRole", async () => {
			const result = await server.executeGraphQLQuery({
				query: CREATE_ROLE,
				variables: { worldId: world._id.toString(), name: "new role" },
			});
			expect(result).toMatchSnapshot({
				data: {
					createRole: {
						_id: expect.any(String),
						roles: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
								members: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									}),
								]),
								permissions: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
										subject: expect.objectContaining({
											_id: expect.any(String),
										}),
									}),
								]),
							}),
						]),
						accessControlList: expect.any(Array),
					},
				},
				errors: undefined,
			});
		});

		test("createRole permission denied", async () => {
			mockSessionContextFactory.setCurrentUser(otherUser);
			const result = await server.executeGraphQLQuery({
				query: CREATE_ROLE,
				variables: { worldId: world._id.toString(), name: "new role" },
			});
			expect(result).toMatchSnapshot();
		});

		test("deleteRole", async () => {
			const role = roleFactory(null, "other delete role", world._id, []);
			await roleRepo.create(role);
			const result = await server.executeGraphQLQuery({
				query: DELETE_ROLE,
				variables: { roleId: role._id.toString() },
			});
			expect(result).toMatchSnapshot({
				data: {
					deleteRole: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		test("deleteRole permission denied", async () => {
			mockSessionContextFactory.resetCurrentUser();
			const role = roleFactory(null, "other role", world._id, []);
			await roleRepo.create(role);
			const result = await server.executeGraphQLQuery({
				query: DELETE_ROLE,
				variables: { roleId: role._id.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		test("addUserRole", async () => {
			const result = await server.executeGraphQLQuery({
				query: ADD_USER_ROLE,
				variables: {
					userId: otherUser._id.toString(),
					roleId: testRole._id.toString(),
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					addUserRole: {
						_id: expect.any(String),
						roles: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
								members: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									}),
								]),
								permissions: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
										subject: expect.objectContaining({
											_id: expect.any(String),
										}),
									}),
								]),
								world: {
									_id: expect.any(String),
								},
							}),
						]),
						accessControlList: expect.any(Array),
					},
				},
				errors: undefined,
			});
		});

		test("addUserRole permission denied", async () => {
			mockSessionContextFactory.resetCurrentUser();
			const result = await server.executeGraphQLQuery({
				query: ADD_USER_ROLE,
				variables: {
					userId: otherUser._id.toString(),
					roleId: testRole._id.toString(),
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("removeUserRole", async () => {
			const result = await server.executeGraphQLQuery({
				query: REMOVE_USER_ROLE,
				variables: {
					userId: otherUser._id.toString(),
					roleId: testRole._id.toString(),
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					removeUserRole: {
						_id: expect.any(String),
						roles: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
								members: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									}),
								]),
								permissions: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
										subject: expect.objectContaining({
											_id: expect.any(String),
										}),
									}),
								]),
								world: {
									_id: expect.any(String),
								},
							}),
						]),
					},
				},
				errors: undefined,
			});
		});

		test("removeUserRole permission denied", async () => {
			await authorizationService.addUserRole(testerSecurityContext, otherUser._id, testRole._id);
			mockSessionContextFactory.resetCurrentUser();
			const result = await server.executeGraphQLQuery({
				query: REMOVE_USER_ROLE,
				variables: {
					userId: otherUser._id.toString(),
					roleId: testRole._id.toString(),
				},
			});
			expect(result).toMatchSnapshot();
		});
	});
});
