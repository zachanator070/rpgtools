import {
	ApplicationService,
	AuthorizationService,
	EntityAuthorizationRuleset,
	PermissionAssignmentRepository,
	RoleRepository,
	UserRepository,
	WorldRepository,
} from "../types";
import { User } from "../domain-entities/user";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { SecurityContext } from "../security-context";
import { FilterCondition } from "../dal/filter-condition";
import { PermissionAssignmentAuthorizationRuleset } from "../security/permission-assignment-authorization-ruleset";
import { Role } from "../domain-entities/role";
import { World } from "../domain-entities/world";
import { ROLE_ADD, ROLE_ADMIN, ROLE_RW } from "../../../common/src/permission-constants";
import { ROLE } from "../../../common/src/type-constants";
import { EVERYONE, WORLD_OWNER } from "../../../common/src/role-constants";
import { RoleAuthorizationRuleset } from "../security/role-authorization-ruleset";

export class AuthorizationApplicationService implements AuthorizationService {
	@inject(INJECTABLE_TYPES.PermissionAssignmentRepository)
	permissionAssignmentRepository: PermissionAssignmentRepository;

	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;

	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: RoleRepository;

	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	permissionAssignmentAuthorizationRuleset: EntityAuthorizationRuleset<PermissionAssignment> = new PermissionAssignmentAuthorizationRuleset();
	roleAuthorizationRuleset: EntityAuthorizationRuleset<Role> = new RoleAuthorizationRuleset();

	grantUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string
	): Promise<User> => {
		const user = await this.userRepository.findOne([new FilterCondition("_id", userId)]);
		if (!user) {
			throw new Error(`User with id ${userId} does not exist`);
		}
		let assignment: PermissionAssignment = await this.permissionAssignmentRepository.findOne([
			new FilterCondition("permission", permission),
			new FilterCondition("subjectId", subjectId),
			new FilterCondition("subjectType", subjectType),
		]);
		let needsCreation: boolean = false;
		if (!assignment) {
			assignment = new PermissionAssignment("", permission, subjectId, subjectType);
			needsCreation = true;
		}
		if (!(await this.permissionAssignmentAuthorizationRuleset.canWrite(context, assignment))) {
			throw new Error(
				`You do not have permission to assign the permission "${permission}" for this subject`
			);
		}
		if (needsCreation) {
			await this.permissionAssignmentRepository.create(assignment);
		}
		// check if user already has that permission
		for (let userPermission of user.permissions) {
			if (userPermission === assignment._id) {
				return user;
			}
		}
		user.permissions.push(assignment._id);
		await this.userRepository.update(user);
		return user;
	};

	revokeUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		userId: string
	): Promise<User> => {
		const user = await this.userRepository.findOne([new FilterCondition("_id", userId)]);
		if (!user) {
			throw new Error("User does not exist");
		}

		let permissionAssignment = await this.permissionAssignmentRepository.findOne([
			new FilterCondition("permission", permission),
			new FilterCondition("subjectId", subjectId),
		]);
		if (permissionAssignment) {
			if (
				!(await this.permissionAssignmentAuthorizationRuleset.canWrite(
					context,
					permissionAssignment
				))
			) {
				throw new Error(
					`You do not have permission to revoke the permission "${permissionAssignment.permission}"`
				);
			}
			user.permissions = user.permissions.filter(
				(userPermission) => userPermission !== permissionAssignment._id
			);
			await this.userRepository.update(user);
		}

		return user;
	};

	grantRolePermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string
	): Promise<Role> => {
		const role = await this.roleRepository.findOne([new FilterCondition("_id", userId)]);
		if (!role) {
			throw new Error(`Role with id ${userId} does not exist`);
		}
		let assignment: PermissionAssignment = await this.permissionAssignmentRepository.findOne([
			new FilterCondition("permission", permission),
			new FilterCondition("subjectId", subjectId),
			new FilterCondition("subjectType", subjectType),
		]);
		let needsCreation: boolean = false;
		if (!assignment) {
			assignment = new PermissionAssignment("", permission, subjectId, subjectType);
			needsCreation = true;
		}
		if (!(await this.permissionAssignmentAuthorizationRuleset.canWrite(context, assignment))) {
			throw new Error(
				`You do not have permission to assign the permission "${permission}" for this subject`
			);
		}
		if (needsCreation) {
			await this.permissionAssignmentRepository.create(assignment);
		}
		// check if user already has that permission
		for (let userPermission of role.permissions) {
			if (userPermission === assignment._id) {
				return role;
			}
		}
		role.permissions.push(assignment._id);
		await this.roleRepository.update(role);
		return role;
	};

	revokeRolePermission = async (
		context: SecurityContext,
		roleId: string,
		permission: string,
		subjectId: string
	): Promise<Role> => {
		const role = await this.roleRepository.findOne([new FilterCondition("_id", roleId)]);
		if (!role) {
			throw new Error("Role does not exist");
		}

		let permissionAssignment = await this.permissionAssignmentRepository.findOne([
			new FilterCondition("permission", permission),
			new FilterCondition("subjectId", subjectId),
		]);
		if (permissionAssignment) {
			if (
				!(await this.permissionAssignmentAuthorizationRuleset.canWrite(
					context,
					permissionAssignment
				))
			) {
				throw new Error(
					`You do not have permission to revoke the permission "${permissionAssignment.permission}"`
				);
			}
			role.permissions = role.permissions.filter(
				(userPermission) => userPermission !== permissionAssignment._id
			);
			await this.roleRepository.update(role);
		}

		return role;
	};

	createRole = async (context: SecurityContext, worldId: string, name: string): Promise<World> => {
		const world = await this.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!(await context.hasPermission(ROLE_ADD, worldId))) {
			throw new Error(`You do not have permission to add roles to this world`);
		}
		const newRole = new Role("", name, worldId, []);
		await this.roleRepository.create(newRole);
		world.roles.push(newRole._id);
		await this.worldRepository.update(world);
		for (let permission of [ROLE_ADMIN, ROLE_RW]) {
			const permissionAssignment = new PermissionAssignment("", permission, newRole._id, ROLE);
			await this.permissionAssignmentRepository.create(permissionAssignment);
			context.user.permissions.push(permissionAssignment._id);
		}
		await this.userRepository.update(context.user);
		return world;
	};

	deleteRole = async (context: SecurityContext, roleId: string): Promise<World> => {
		const role = await this.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}
		if (!(await this.roleAuthorizationRuleset.canWrite(context, role))) {
			throw new Error(`You do not have write permissions for this role`);
		}
		if (role.name === WORLD_OWNER || role.name === EVERYONE) {
			throw new Error("You cannot delete this role");
		}
		const world = await this.worldRepository.findById(role.world);
		world.roles = world.roles.filter((otherRole) => {
			return otherRole === role._id;
		});
		await this.worldRepository.update(world);
		await this.cleanUpPermissions(role._id);
		await this.roleRepository.delete(role);
		return world;
	};

	// deletes permissions of a subject that has been delete
	cleanUpPermissions = async (subjectId: string) => {
		const assignments = await this.permissionAssignmentRepository.find([
			new FilterCondition("subject", subjectId),
		]);
		for (let assignment of assignments) {
			const roles = await this.roleRepository.find([
				new FilterCondition("permissions", assignment._id),
			]);
			for (let role of roles) {
				role.permissions = role.permissions.filter((permission) => {
					return permission !== assignment._id;
				});
				await this.roleRepository.update(role);
			}
			const users = await this.userRepository.find([
				new FilterCondition("permissions", assignment._id),
			]);
			for (let user of users) {
				user.permissions = user.permissions.filter((permission) => {
					return permission !== assignment._id;
				});
				await this.userRepository.update(user);
			}
			await this.permissionAssignmentRepository.delete(assignment);
		}
	};

	addUserRole = async (
		context: SecurityContext,
		userId: string,
		roleId: string
	): Promise<World> => {
		const role = await this.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}

		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new Error(`Role ${userId} doesn't exist`);
		}

		if (!(await this.roleAuthorizationRuleset.canWrite(context, role))) {
			throw new Error(`You do not have permission to manage this role`);
		}

		user.roles.push(role._id);
		await this.userRepository.update(user);
		return await this.worldRepository.findById(role.world);
	};

	removeUserRole = async (
		context: SecurityContext,
		userId: string,
		roleId: string
	): Promise<World> => {
		const role = await this.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}

		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new Error(`Role ${userId} doesn't exist`);
		}

		if (!(await this.roleAuthorizationRuleset.canWrite(context, role))) {
			throw new Error(`You do not have permission to manage this role`);
		}

		if (role.name === WORLD_OWNER) {
			const otherOwners = await this.userRepository.find([new FilterCondition("roles", role._id)]);
			if (otherOwners.length === 1) {
				throw new Error("World must have at least one owner");
			}
		}

		user.roles = user.roles.filter((userRole) => userRole !== role._id);
		await this.userRepository.update(user);
		return await this.worldRepository.findById(role.world);
	};
}
