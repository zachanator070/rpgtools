import { AuthorizationService, EntityAuthorizationRuleset, UnitOfWork } from "../types";
import { User } from "../domain-entities/user";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { SecurityContext } from "../security-context";
import { FilterCondition } from "../dal/filter-condition";
import { PermissionAssignmentAuthorizationRuleset } from "../security/permission-assignment-authorization-ruleset";
import { Role } from "../domain-entities/role";
import { World } from "../domain-entities/world";
import { ROLE_ADD, ROLE_ADMIN, ROLE_RW } from "../../../common/src/permission-constants";
import { ROLE } from "../../../common/src/type-constants";
import { EVERYONE, WORLD_OWNER } from "../../../common/src/role-constants";
import { RoleAuthorizationRuleset } from "../security/role-authorization-ruleset";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { injectable } from "inversify";

@injectable()
export class AuthorizationApplicationService implements AuthorizationService {
	permissionAssignmentAuthorizationRuleset: PermissionAssignmentAuthorizationRuleset = new PermissionAssignmentAuthorizationRuleset();
	roleAuthorizationRuleset: RoleAuthorizationRuleset = new RoleAuthorizationRuleset();

	grantUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string
	): Promise<User> => {
		const unitOfWork = new DbUnitOfWork();
		const user = await unitOfWork.userRepository.findOne([new FilterCondition("_id", userId)]);
		if (!user) {
			throw new Error(`User with id ${userId} does not exist`);
		}
		let assignment: PermissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
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
			await unitOfWork.permissionAssignmentRepository.create(assignment);
		}
		// check if user already has that permission
		for (let userPermission of user.permissions) {
			if (userPermission === assignment._id) {
				return user;
			}
		}
		user.permissions.push(assignment._id);
		await unitOfWork.userRepository.update(user);
		await unitOfWork.commit();
		return user;
	};

	revokeUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		userId: string
	): Promise<User> => {
		const unitOfWork = new DbUnitOfWork();
		const user = await unitOfWork.userRepository.findOne([new FilterCondition("_id", userId)]);
		if (!user) {
			throw new Error("User does not exist");
		}

		let permissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
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
			await unitOfWork.userRepository.update(user);
		}
		await unitOfWork.commit();
		return user;
	};

	grantRolePermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string
	): Promise<Role> => {
		const unitOfWork = new DbUnitOfWork();
		const role = await unitOfWork.roleRepository.findOne([new FilterCondition("_id", userId)]);
		if (!role) {
			throw new Error(`Role with id ${userId} does not exist`);
		}
		let assignment: PermissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
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
			await unitOfWork.permissionAssignmentRepository.create(assignment);
		}
		// check if user already has that permission
		for (let userPermission of role.permissions) {
			if (userPermission === assignment._id) {
				return role;
			}
		}
		role.permissions.push(assignment._id);
		await unitOfWork.roleRepository.update(role);
		await unitOfWork.commit();
		return role;
	};

	revokeRolePermission = async (
		context: SecurityContext,
		roleId: string,
		permission: string,
		subjectId: string
	): Promise<Role> => {
		const unitOfWork = new DbUnitOfWork();
		const role = await unitOfWork.roleRepository.findOne([new FilterCondition("_id", roleId)]);
		if (!role) {
			throw new Error("Role does not exist");
		}

		let permissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
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
			await unitOfWork.roleRepository.update(role);
		}
		await unitOfWork.commit();
		return role;
	};

	createRole = async (context: SecurityContext, worldId: string, name: string): Promise<World> => {
		const unitOfWork = new DbUnitOfWork();
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!(await context.hasPermission(ROLE_ADD, worldId))) {
			throw new Error(`You do not have permission to add roles to this world`);
		}
		const newRole = new Role("", name, worldId, []);
		await unitOfWork.roleRepository.create(newRole);
		world.roles.push(newRole._id);
		await unitOfWork.worldRepository.update(world);
		for (let permission of [ROLE_ADMIN, ROLE_RW]) {
			const permissionAssignment = new PermissionAssignment("", permission, newRole._id, ROLE);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			context.user.permissions.push(permissionAssignment._id);
		}
		await unitOfWork.userRepository.update(context.user);
		await unitOfWork.commit();
		return world;
	};

	deleteRole = async (context: SecurityContext, roleId: string): Promise<World> => {
		const unitOfWork = new DbUnitOfWork();
		const role = await unitOfWork.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}
		if (!(await this.roleAuthorizationRuleset.canWrite(context, role))) {
			throw new Error(`You do not have write permissions for this role`);
		}
		if (role.name === WORLD_OWNER || role.name === EVERYONE) {
			throw new Error("You cannot delete this role");
		}
		const world = await unitOfWork.worldRepository.findById(role.world);
		world.roles = world.roles.filter((otherRole) => {
			return otherRole === role._id;
		});
		await unitOfWork.worldRepository.update(world);
		await this.cleanUpPermissions(role._id, unitOfWork);
		await unitOfWork.roleRepository.delete(role);
		await unitOfWork.commit();
		return world;
	};

	// deletes permissions of a subject that has been delete
	cleanUpPermissions = async (subjectId: string, unitOfWork: UnitOfWork) => {
		const assignments = await unitOfWork.permissionAssignmentRepository.find([
			new FilterCondition("subject", subjectId),
		]);
		for (let assignment of assignments) {
			const roles = await unitOfWork.roleRepository.find([
				new FilterCondition("permissions", assignment._id),
			]);
			for (let role of roles) {
				role.permissions = role.permissions.filter((permission) => {
					return permission !== assignment._id;
				});
				await unitOfWork.roleRepository.update(role);
			}
			const users = await unitOfWork.userRepository.find([
				new FilterCondition("permissions", assignment._id),
			]);
			for (let user of users) {
				user.permissions = user.permissions.filter((permission) => {
					return permission !== assignment._id;
				});
				await unitOfWork.userRepository.update(user);
			}
			await unitOfWork.permissionAssignmentRepository.delete(assignment);
		}
	};

	addUserRole = async (
		context: SecurityContext,
		userId: string,
		roleId: string
	): Promise<World> => {
		const unitOfWork = new DbUnitOfWork();
		const role = await unitOfWork.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}

		const user = await unitOfWork.userRepository.findById(userId);
		if (!user) {
			throw new Error(`Role ${userId} doesn't exist`);
		}

		if (!(await this.roleAuthorizationRuleset.canWrite(context, role))) {
			throw new Error(`You do not have permission to manage this role`);
		}

		user.roles.push(role._id);
		await unitOfWork.userRepository.update(user);
		const world = await unitOfWork.worldRepository.findById(role.world);
		await unitOfWork.commit();
		return world;
	};

	removeUserRole = async (
		context: SecurityContext,
		userId: string,
		roleId: string
	): Promise<World> => {
		const unitOfWork = new DbUnitOfWork();
		const role = await unitOfWork.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}

		const user = await unitOfWork.userRepository.findById(userId);
		if (!user) {
			throw new Error(`Role ${userId} doesn't exist`);
		}

		if (!(await this.roleAuthorizationRuleset.canWrite(context, role))) {
			throw new Error(`You do not have permission to manage this role`);
		}

		if (role.name === WORLD_OWNER) {
			const otherOwners = await unitOfWork.userRepository.find([
				new FilterCondition("roles", role._id),
			]);
			if (otherOwners.length === 1) {
				throw new Error("World must have at least one owner");
			}
		}

		user.roles = user.roles.filter((userRole) => userRole !== role._id);
		await unitOfWork.userRepository.update(user);
		const world = await unitOfWork.worldRepository.findById(role.world);
		await unitOfWork.commit();
		return world;
	};
}
