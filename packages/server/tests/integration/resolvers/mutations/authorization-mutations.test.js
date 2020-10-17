import {ApolloServer} from "apollo-server-express";
import {typeDefs} from "../../../../src/gql-server-schema";
import {serverResolvers} from "../../../../src/resolvers/server-resolvers";
import {User} from "../../../../src/models/user";
import {createTestClient} from "apollo-server-testing";
import {createWorld} from "../../../../src/resolvers/mutations/world-mutations";
import {ANON_USERNAME, WIKI_READ, WIKI_RW, WORLD_READ} from "@rpgtools/common/src/permission-constants";
import {PLACE, WORLD} from "@rpgtools/common/src/type-constants";
import {PermissionAssignment} from "../../../../src/models/permission-assignement";
import {Role} from "../../../../src/models/role";
import {ADD_USER_ROLE} from "../../../../../app/src/hooks/authorization/useAddUserRole";
import {CREATE_ROLE} from "../../../../../app/src/hooks/authorization/useCreateRole";
import {DELETE_ROLE} from "../../../../../app/src/hooks/authorization/useDeleteRole";
import {GRANT_ROLE_PERMISSION} from "../../../../../app/src/hooks/authorization/useGrantRolePermission";
import {GRANT_USER_PERMISSION} from "../../../../../app/src/hooks/authorization/useGrantUserPermisison";
import {REMOVE_USER_ROLE} from "../../../../../app/src/hooks/authorization/useRemoveUserRole";
import {REVOKE_ROLE_PERMISSION} from "../../../../../app/src/hooks/authorization/useRevokeRolePermission";
import {REVOKE_USER_PERMISSION} from "../../../../../app/src/hooks/authorization/useRevokeUserPermission";

process.env.TEST_SUITE = 'authorization-mutations-test';

describe('authorization-mutations', () => {

	let currentUser = null;

	const server = new ApolloServer({
		typeDefs,
		resolvers: serverResolvers,
		context: () => {
			return {
				currentUser: currentUser,
				res: {
					cookie: () => {
					}
				}
			};
		}
	});

	const { mutate } = createTestClient(server);

	let world = null;
	let otherUser = null;

	beforeEach(async () => {
		currentUser = await User.findOne({username: 'tester'});
		otherUser = await User.create({username: 'tester2'});
		await currentUser.recalculateAllPermissions();
		world = await createWorld('Earth', false, currentUser);
	});

	test('grantUserPermission', async () => {
		const result = await mutate({mutation: GRANT_USER_PERMISSION, variables:
				{userId: otherUser._id.toString(), permission: WORLD_READ, subjectId: world._id.toString(), subjectType: WORLD}
		});
		expect(result).toMatchSnapshot({
			data:{
				grantUserPermission:{
					_id: expect.any(String),
					usersWithPermissions: [{
						_id: expect.any(String),
						permissions: [{
							_id: expect.any(String),
							subject: {
								_id: expect.any(String)
							}
						}]
					}]
				}
			}
		});
	});

	test('grantUserPermission permission denied', async () => {
		currentUser = new User({username: ANON_USERNAME});
		const result = await mutate({mutation: GRANT_USER_PERMISSION, variables:
				{userId: otherUser._id.toString(), permission: WORLD_READ, subjectId: world._id.toString(), subjectType: WORLD}
		});
		expect(result).toMatchSnapshot();
	});

	test('revokeUserPermission', async () => {
		const permission = await PermissionAssignment.create({permission: WIKI_READ, subjectType: PLACE, subject: world.wikiPage});
		otherUser.permissions.push(permission);
		await otherUser.save();
		const result = await mutate({mutation: REVOKE_USER_PERMISSION, variables:
				{userId: otherUser._id.toString(), permissionAssignmentId: permission._id.toString()}
		});
		expect(result).toMatchSnapshot({
			data:{
				revokeUserPermission:{
					_id: expect.any(String),
					usersWithPermissions: []
				}
			}
		});
	});

	test('revokeUserPermission permission denied', async () => {
		currentUser = new User({username: ANON_USERNAME});
		const permission = await PermissionAssignment.create({permission: WIKI_READ, subjectType: PLACE, subject: world.wikiPage});
		otherUser.permissions.push(permission);
		await otherUser.save();
		const result = await mutate({mutation: REVOKE_USER_PERMISSION, variables:
				{userId: otherUser._id.toString(), permissionAssignmentId: permission._id.toString()}
		});
		expect(result).toMatchSnapshot();
	});

	test('grantRolePermission', async () => {
		const role = await Role.create({name: 'other role'});
		const result = await mutate({mutation: GRANT_ROLE_PERMISSION, variables:
				{roleId: role._id.toString(), permission: WIKI_READ, subjectId: world.wikiPage._id.toString(), subjectType: PLACE}
		});
		expect(result).toMatchSnapshot({
			data:{
				grantRolePermission:{
					_id: expect.any(String),
					permissions: [{
						_id: expect.any(String),
						subject: {
							_id: expect.any(String)
						}
					}]
				}
			}
		});
	});

	test('grantRolePermission permission denied', async () => {
		currentUser = new User({username: ANON_USERNAME});
		const role = await Role.create({name: 'other role'});
		const result = await mutate({mutation: GRANT_ROLE_PERMISSION, variables:
				{roleId: role._id.toString(), permission: WIKI_READ, subjectId: world.wikiPage._id.toString(), subjectType: PLACE}
		});
		expect(result).toMatchSnapshot();
	});

	test('revokeRolePermission', async () => {
		const role = await Role.create({name: 'other role'});
		const permission = await PermissionAssignment.create({permission: WIKI_READ, subjectType: PLACE, subject: world.wikiPage});
		const otherPermission = await PermissionAssignment.create({permission: WIKI_RW, subjectType: PLACE, subject: world.wikiPage});
		role.permissions.push(permission);
		role.permissions.push(otherPermission);
		await role.save();
		const result = await mutate({mutation: REVOKE_ROLE_PERMISSION, variables:
				{roleId: role._id.toString(), permissionAssignmentId: permission._id.toString()}
		});
		expect(result).toMatchSnapshot({
			data:{
				revokeRolePermission:{
					_id: expect.any(String),
					permissions: [{
						_id: expect.any(String),
						subject:{
							_id: expect.any(String)
						}
					}]
				}
			}
		});
	});

	test('revokeRolePermission permission denied', async () => {
		currentUser = new User({username: ANON_USERNAME});
		const role = await Role.create({name: 'other role'});
		const permission = await PermissionAssignment.create({permission: WIKI_READ, subjectType: PLACE, subject: world.wikiPage});
		role.permissions.push(permission);
		await role.save();
		const result = await mutate({mutation: REVOKE_ROLE_PERMISSION, variables:
				{roleId: role._id.toString(), permissionAssignmentId: permission._id.toString()}
		});
		expect(result).toMatchSnapshot();
	});

	test('createRole', async () => {
		const result = await mutate({mutation: CREATE_ROLE, variables:
				{worldId: world._id.toString(), name: 'new role'}
		});
		expect(result).toMatchSnapshot({
			data: {
				createRole:{
					_id: expect.any(String),
					roles: expect.arrayContaining([expect.objectContaining({
						_id: expect.any(String),
						members: expect.arrayContaining([expect.objectContaining({
							_id: expect.any(String)
						})]),
						permissions: expect.arrayContaining([expect.objectContaining({
							_id: expect.any(String),
							subject: expect.objectContaining({
								_id: expect.any(String)
							})
						})]),
						world: {
							_id: expect.any(String)
						}
					})])
				}
			}
		});
	});

	test('createRole permission denied', async () => {
		currentUser = otherUser;
		const result = await mutate({mutation: CREATE_ROLE, variables:
				{worldId: world._id.toString(), name: 'new role'}
		});
		expect(result).toMatchSnapshot();
	});

	test('deleteRole', async () => {
		const role = await Role.create({name: 'other role', world: world});
		world.roles.push(role);
		await world.save();
		const result = await mutate({mutation: DELETE_ROLE, variables:
				{roleId: role._id.toString()}
		});
		expect(result).toMatchSnapshot({
			data: {
				deleteRole:{
					_id: expect.any(String),
					roles: expect.arrayContaining([expect.objectContaining({
						_id: expect.any(String),
						members: expect.arrayContaining([expect.objectContaining({
							_id: expect.any(String)
						})]),
						permissions: expect.arrayContaining([expect.objectContaining({
							_id: expect.any(String),
							subject: expect.objectContaining({
								_id: expect.any(String)
							})
						})]),
						world: {
							_id: expect.any(String)
						}
					})])
				}
			}
		});
	});

	test('deleteRole permission denied', async () => {
		currentUser = otherUser;
		const role = await Role.create({name: 'other role', world: world});
		world.roles.push(role);
		await world.save();
		const result = await mutate({mutation: DELETE_ROLE, variables:
				{roleId: role._id.toString()}
		});
		expect(result).toMatchSnapshot();
	});

	test('addUserRole', async () => {
		const role = await Role.create({name: 'other role', world: world});
		world.roles.push(role);
		await world.save();
		const result = await mutate({mutation: ADD_USER_ROLE, variables:
				{userId: otherUser._id.toString(), roleId: role._id.toString()}
		});
		expect(result).toMatchSnapshot({
			data: {
				addUserRole:{
					_id: expect.any(String),
					roles: expect.arrayContaining([expect.objectContaining({
						_id: expect.any(String),
						members: expect.arrayContaining([expect.objectContaining({
							_id: expect.any(String)
						})]),
						permissions: expect.arrayContaining([expect.objectContaining({
							_id: expect.any(String),
							subject: expect.objectContaining({
								_id: expect.any(String)
							})
						})]),
						world: {
							_id: expect.any(String)
						}
					})])
				}
			}
		});
	});

	test('addUserRole permission denied', async () => {
		currentUser = otherUser;
		const role = await Role.create({name: 'other role', world: world});
		world.roles.push(role);
		await world.save();
		const result = await mutate({mutation: ADD_USER_ROLE, variables:
				{userId: otherUser._id.toString(), roleId: role._id.toString()}
		});
		expect(result).toMatchSnapshot();
	});

	test('removeUserRole', async () => {
		const role = await Role.create({name: 'other role', world: world});
		world.roles.push(role);
		await world.save();
		otherUser.roles.push(role);
		await otherUser.save();
		const result = await mutate({mutation: REMOVE_USER_ROLE, variables:
				{userId: otherUser._id.toString(), roleId: role._id.toString()}
		});
		expect(result).toMatchSnapshot({
			data: {
				removeUserRole:{
					_id: expect.any(String),
					roles: expect.arrayContaining([expect.objectContaining({
						_id: expect.any(String),
						members: expect.arrayContaining([expect.objectContaining({
							_id: expect.any(String)
						})]),
						permissions: expect.arrayContaining([expect.objectContaining({
							_id: expect.any(String),
							subject: expect.objectContaining({
								_id: expect.any(String)
							})
						})]),
						world: {
							_id: expect.any(String)
						}
					})])
				}
			}
		});
	});

	test('removeUserRole permission denied', async () => {
		currentUser = new User({username: ANON_USERNAME});
		const role = await Role.create({name: 'other role', world: world});
		world.roles.push(role);
		await world.save();
		otherUser.roles.push(role);
		await otherUser.save();
		const result = await mutate({mutation: REMOVE_USER_ROLE, variables:
				{userId: otherUser._id.toString(), roleId: role._id.toString()}
		});
		expect(result).toMatchSnapshot();
	});
});