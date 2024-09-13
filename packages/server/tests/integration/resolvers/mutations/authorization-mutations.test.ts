import { WIKI_READ, WORLD_READ} from "@rpgtools/common/src/permission-constants";
import { PLACE, WORLD } from "@rpgtools/common/src/type-constants";
import { container } from "../../../../src/di/inversify.js";
import {DbEngine} from "../../../../src/types";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types.js";
import {
	ADD_USER_ROLE,
	CREATE_ROLE,
	DELETE_ROLE,
	GRANT_ROLE_PERMISSION,
	GRANT_USER_PERMISSION, REMOVE_USER_ROLE, REVOKE_ROLE_PERMISSION, REVOKE_USER_PERMISSION
} from "@rpgtools/common/src/gql-mutations";
import {AuthorizationService} from "../../../../src/services/authorization-service.js";
import {DefaultTestingContext} from "../../default-testing-context.js";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types.js";
import {accessControlList} from "../common-testing-assertions.js";
import RoleFactory from "../../../../src/domain-entities/factory/role-factory.js";

process.env.TEST_SUITE = "authorization-mutations-test";

describe("authorization-mutations", () => {
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

	const authorizationService = container.get<AuthorizationService>(
		INJECTABLE_TYPES.AuthorizationService
	);
	const roleFactory = container.get<RoleFactory>(INJECTABLE_TYPES.RoleFactory);

	describe("with tester logged in and world created", () => {
		beforeEach(async () => {
			await testingContext.reset();
		});

		test("grantUserPermission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: GRANT_USER_PERMISSION,
				variables: {
					userId: testingContext.tester2._id.toString(),
					permission: WORLD_READ,
					subjectId: testingContext.world._id.toString(),
					subjectType: WORLD,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					grantUserPermission: expect.objectContaining({
						_id: expect.any(String),
						accessControlList: accessControlList
					}),
				},
				errors: undefined,
			});
		});

		test("grantUserPermission permission denied", async () => {
			testingContext.mockSessionContextFactory.useAnonUser();
			const result = await testingContext.server.executeGraphQLQuery({
				query: GRANT_USER_PERMISSION,
				variables: {
					userId: testingContext.tester2._id.toString(),
					permission: WORLD_READ,
					subjectId: testingContext.world._id.toString(),
					subjectType: WORLD,
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("revokeUserPermission", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			await authorizationService.grantUserPermission(
				testingContext.tester1SecurityContext,
				WIKI_READ,
				testingContext.world.wikiPage,
				PLACE,
				testingContext.tester2._id,
				databaseContext
			);
			const result = await testingContext.server.executeGraphQLQuery({
				query: REVOKE_USER_PERMISSION,
				variables: {
					userId: testingContext.tester2._id.toString(),
					permission: WIKI_READ,
					subjectId: testingContext.world.wikiPage,
					subjectType: PLACE
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					revokeUserPermission: {
						_id: expect.any(String),
						accessControlList: []
					},
				},
				errors: undefined,
			});
		});

		test("revokeUserPermission permission denied", async () => {
			testingContext.mockSessionContextFactory.useAnonUser();
			const result = await testingContext.server.executeGraphQLQuery({
				query: REVOKE_USER_PERMISSION,
				variables: {
					userId: testingContext.tester2._id.toString(),
					permission: WORLD_READ,
					subjectId: testingContext.world._id.toString(),
					subjectType: WORLD
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("grantRolePermission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: GRANT_ROLE_PERMISSION,
				variables: {
					roleId: testingContext.testRole._id,
					permission: WIKI_READ,
					subjectId: testingContext.world.wikiPage,
					subjectType: PLACE,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					grantRolePermission: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		test("grantRolePermission permission denied", async () => {
			testingContext.mockSessionContextFactory.useAnonUser();
			const result = await testingContext.server.executeGraphQLQuery({
				query: GRANT_ROLE_PERMISSION,
				variables: {
					roleId: testingContext.testRole._id,
					permission: WIKI_READ,
					subjectId: testingContext.world.wikiPage,
					subjectType: PLACE,
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("revokeRolePermission", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			await authorizationService.grantRolePermission(
				testingContext.tester1SecurityContext,
				WIKI_READ,
				testingContext.world.wikiPage,
				PLACE,
				testingContext.testRole._id,
				databaseContext
			);
			const result = await testingContext.server.executeGraphQLQuery({
				query: REVOKE_ROLE_PERMISSION,
				variables: {
					roleId: testingContext.testRole._id.toString(),
					permission: WIKI_READ,
					subjectId: testingContext.world.wikiPage,
					subjectType: PLACE
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					revokeRolePermission: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		test("revokeRolePermission permission denied", async () => {
			testingContext.mockSessionContextFactory.useAnonUser();
			const databaseContext = await dbEngine.createDatabaseContext();
			await authorizationService.grantRolePermission(
				testingContext.tester1SecurityContext,
				WIKI_READ,
				testingContext.world.wikiPage,
				PLACE,
				testingContext.testRole._id,
				databaseContext
			);
			const result = await testingContext.server.executeGraphQLQuery({
				query: REVOKE_ROLE_PERMISSION,
				variables: {
					roleId: testingContext.testRole._id.toString(),
					permission: WIKI_READ,
					subjectId: testingContext.world.wikiPage,
					subjectType: PLACE
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("createRole", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_ROLE,
				variables: { worldId: testingContext.world._id.toString(), name: "new role" },
			});
			expect(result).toMatchSnapshot({
				data: {
					createRole: {
						_id: expect.any(String),
						members: expect.any(Array),
						accessControlList: accessControlList,
						world: {
							_id: expect.any(String)
						}
					},
				},
				errors: undefined,
			});
		});

		test("createRole permission denied", async () => {
			testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_ROLE,
				variables: { worldId: testingContext.world._id.toString(), name: "new role" },
			});
			expect(result).toMatchSnapshot();
		});

		test("deleteRole", async () => {
			const role = roleFactory.build({name: "other delete role", world: testingContext.world._id, acl: []});
			const databaseContext = await dbEngine.createDatabaseContext();
			await databaseContext.roleRepository.create(role);
			const result = await testingContext.server.executeGraphQLQuery({
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
			testingContext.mockSessionContextFactory.useAnonUser();
			const role = roleFactory.build({name: "other role", world: testingContext.world._id, acl: []});
			const databaseContext = await dbEngine.createDatabaseContext();
			await databaseContext.roleRepository.create(role);
			const result = await testingContext.server.executeGraphQLQuery({
				query: DELETE_ROLE,
				variables: { roleId: role._id.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		test("addUserRole", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: ADD_USER_ROLE,
				variables: {
					userId: testingContext.tester2._id.toString(),
					roleId: testingContext.testRole._id.toString(),
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					addUserRole: {
						_id: expect.any(String),
						members: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
							}),
						]),
						world: {
							_id: expect.any(String),
						},
						accessControlList: accessControlList
					},
				},
				errors: undefined,
			});
		});

		test("addUserRole permission denied", async () => {
			testingContext.mockSessionContextFactory.useAnonUser();
			const result = await testingContext.server.executeGraphQLQuery({
				query: ADD_USER_ROLE,
				variables: {
					userId: testingContext.tester2._id.toString(),
					roleId: testingContext.testRole._id.toString(),
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("removeUserRole", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: REMOVE_USER_ROLE,
				variables: {
					userId: testingContext.tester2._id.toString(),
					roleId: testingContext.testRole._id.toString(),
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					removeUserRole: {
						_id: expect.any(String),
						members: expect.any(Array),
						accessControlList: accessControlList,
						world: {
							_id: expect.any(String),
						},
					},
				},
				errors: undefined,
			});
		});

		test("removeUserRole permission denied", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			await authorizationService.addUserRole(testingContext.tester1SecurityContext, testingContext.tester2._id, testingContext.testRole._id, databaseContext);
			testingContext.mockSessionContextFactory.useAnonUser();
			const result = await testingContext.server.executeGraphQLQuery({
				query: REMOVE_USER_ROLE,
				variables: {
					userId: testingContext.tester2._id.toString(),
					roleId: testingContext.testRole._id.toString(),
				},
			});
			expect(result).toMatchSnapshot();
		});
	});
});
