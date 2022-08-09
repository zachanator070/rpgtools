import {
	DomainEntity,
	PermissionAssignmentFactory,
	Repository,
	RoleFactory,
	UnitOfWork,
} from "../types";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { SecurityContext } from "../security/security-context";
import { FilterCondition } from "../dal/filter-condition";
import { Role } from "../domain-entities/role";
import { World } from "../domain-entities/world";
import { ROLE_ADD, ROLE_ADMIN, ROLE_RW } from "@rpgtools/common/src/permission-constants";
import { ROLE } from "@rpgtools/common/src/type-constants";
import {EVERYONE, LOGGED_IN, WORLD_OWNER} from "@rpgtools/common/src/role-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { User } from "../domain-entities/user";
import EntityMapper from "../domain-entities/entity-mapper";

@injectable()
export class AuthorizationService {

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	@inject(INJECTABLE_TYPES.EntityMapper)
	mapper: EntityMapper;

	grantUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string,
		unitOfWork: UnitOfWork
	): Promise<DomainEntity> => {
		const user = await unitOfWork.userRepository.findOne([new FilterCondition("_id", userId)]);
		if (!user) {
			throw new Error(`User with id ${userId} does not exist`);
		}
		await this.grantPrincipalPermission(
			unitOfWork,
			context,
			permission,
			subjectId,
			subjectType,
			user,
			unitOfWork.userRepository
		);
		return this.mapper.map(subjectType).getRepository(unitOfWork).findById(subjectId);
	};

	revokeUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		userId: string,
		unitOfWork: UnitOfWork
	): Promise<DomainEntity> => {
		const user = await unitOfWork.userRepository.findOne([new FilterCondition("_id", userId)]);
		if (!user) {
			throw new Error("User does not exist");
		}
		const permissionAssignment = await this.revokeEntityPermission(
			unitOfWork,
			context,
			permission,
			subjectId,
			user,
			unitOfWork.userRepository
		);
		return this.mapper.map(permissionAssignment.subjectType).getRepository(unitOfWork).findById(subjectId);
	};

	grantRolePermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		roleId: string,
		unitOfWork: UnitOfWork
	): Promise<Role> => {
		const role = await unitOfWork.roleRepository.findOne([new FilterCondition("_id", roleId)]);
		if (!role) {
			throw new Error(`Role with id ${roleId} does not exist`);
		}
		await this.grantPrincipalPermission(
			unitOfWork,
			context,
			permission,
			subjectId,
			subjectType,
			role,
			unitOfWork.roleRepository
		);
		return role;
	};

	revokeRolePermission = async (
		context: SecurityContext,
		roleId: string,
		permission: string,
		subjectId: string,
		unitOfWork: UnitOfWork
	): Promise<Role> => {
		const role = await unitOfWork.roleRepository.findOne([new FilterCondition("_id", roleId)]);
		if (!role) {
			throw new Error("Role does not exist");
		}

		await this.revokeEntityPermission(
			unitOfWork,
			context,
			permission,
			subjectId,
			role,
			unitOfWork.roleRepository
		);
		return role;
	};

	createRole = async (context: SecurityContext, worldId: string, name: string, unitOfWork: UnitOfWork): Promise<Role> => {
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!(await context.hasPermission(ROLE_ADD, worldId))) {
			throw new Error(`You do not have permission to add roles to this world`);
		}
		const newRole = this.roleFactory({_id: null, name, world: worldId, permissions: []});
		await unitOfWork.roleRepository.create(newRole);
		for (let permission of [ROLE_ADMIN, ROLE_RW]) {
			const permissionAssignment = this.permissionAssignmentFactory(
				{
					_id: null,
					permission,
					subject: newRole._id,
					subjectType: ROLE
				}
			);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			context.user.permissions.push(permissionAssignment._id);
		}
		await unitOfWork.userRepository.update(context.user);
		return newRole;
	};

	deleteRole = async (context: SecurityContext, roleId: string, unitOfWork: UnitOfWork): Promise<Role> => {
		const role = await unitOfWork.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}
		if (!(await role.authorizationPolicy.canWrite(context))) {
			throw new Error(`You do not have write permissions for this role`);
		}
		if (role.name === WORLD_OWNER || role.name === EVERYONE || role.name === LOGGED_IN) {
			throw new Error("You cannot delete this role");
		}
		await this.cleanUpPermissions(role._id, unitOfWork);
		const usersWithRole = await unitOfWork.userRepository.find([new FilterCondition('role', role._id)]);
		for(let user of usersWithRole) {
			user.roles = user.roles.filter(id => id !== role._id);
			await unitOfWork.userRepository.update(user);
		}
		await unitOfWork.roleRepository.delete(role);
		return role;
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
		roleId: string,
		unitOfWork: UnitOfWork
	): Promise<Role> => {
		const role = await unitOfWork.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}

		const user = await unitOfWork.userRepository.findById(userId);
		if (!user) {
			throw new Error(`Role ${userId} doesn't exist`);
		}

		if (!(await role.authorizationPolicy.canWrite(context))) {
			throw new Error(`You do not have permission to manage this role`);
		}

		user.roles.push(role._id);
		await unitOfWork.userRepository.update(user);
		return role;
	};

	removeUserRole = async (
		context: SecurityContext,
		userId: string,
		roleId: string,
		unitOfWork: UnitOfWork
	): Promise<Role> => {
		const role = await unitOfWork.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}

		const user = await unitOfWork.userRepository.findById(userId);
		if (!user) {
			throw new Error(`Role ${userId} doesn't exist`);
		}

		if (!(await role.authorizationPolicy.canWrite(context))) {
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
		return role;
	};

	private grantPrincipalPermission = async (
		unitOfWork: UnitOfWork,
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		principal: User | Role,
		entityRepository: Repository<any>
	) => {
		let assignment: PermissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
			new FilterCondition("permission", permission),
			new FilterCondition("subject", subjectId),
			new FilterCondition("subjectType", subjectType),
		]);
		let needsCreation = false;
		if (!assignment) {
			assignment = this.permissionAssignmentFactory({_id: null, permission, subject: subjectId, subjectType});
			needsCreation = true;
		}
		const subject: DomainEntity = await this.mapper.map(subjectType).getRepository(unitOfWork).findById(subjectId);
		if (!(await subject.authorizationPolicy.canAdmin(context, unitOfWork))) {
			throw new Error(
				`You do not have permission to assign the permission "${permission}" for this subject`
			);
		}
		if (needsCreation) {
			await unitOfWork.permissionAssignmentRepository.create(assignment);
		}
		// check if entity already has that permission
		for (let entityPermission of principal.permissions) {
			if (entityPermission === assignment._id) {
				return;
			}
		}
		principal.permissions.push(assignment._id);
		await entityRepository.update(principal);
	};

	private revokeEntityPermission = async (
		unitOfWork: UnitOfWork,
		context: SecurityContext,
		permission: string,
		subjectId: string,
		entity: User | Role,
		entityRepository: Repository<any>
	) => {
		let permissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
			new FilterCondition("permission", permission),
			new FilterCondition("subject", subjectId),
		]);
		if (!permissionAssignment) {
			throw new Error(
				`Permission assignment does not exist for permission '${permission}'`
			);
		}
		const subject: DomainEntity = await this.mapper.map(permissionAssignment.subjectType).getRepository(unitOfWork).findById(subjectId);
		if (!(await subject.authorizationPolicy.canAdmin(context, unitOfWork))) {
			throw new Error(
				`You do not have permission to revoke the permission "${permissionAssignment.permission}"`
			);
		}
		entity.permissions = entity.permissions.filter(
			(entityPermission) => entityPermission !== permissionAssignment._id
		);
		await entityRepository.update(entity);
		return permissionAssignment;
	};
}
