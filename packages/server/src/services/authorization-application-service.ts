import {
	AuthorizationService,
	DomainEntity,
	Factory,
	PermissionAssignmentFactory,
	Repository,
	RoleFactory,
	UnitOfWork,
} from "../types";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { SecurityContext } from "../security/security-context";
import { FilterCondition } from "../dal/filter-condition";
import { PermissionAssignmentAuthorizationRuleset } from "../security/ruleset/permission-assignment-authorization-ruleset";
import { Role } from "../domain-entities/role";
import { World } from "../domain-entities/world";
import { ROLE_ADD, ROLE_ADMIN, ROLE_RW } from "@rpgtools/common/src/permission-constants";
import { ROLE } from "@rpgtools/common/src/type-constants";
import {EVERYONE, LOGGED_IN, WORLD_OWNER} from "@rpgtools/common/src/role-constants";
import { RoleAuthorizationRuleset } from "../security/ruleset/role-authorization-ruleset";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { RepositoryMapper } from "../dal/repository-mapper";
import { User } from "../domain-entities/user";

@injectable()
export class AuthorizationApplicationService implements AuthorizationService {
	@inject(INJECTABLE_TYPES.PermissionAssignmentAuthorizationRuleset)
	permissionAssignmentAuthorizationRuleset: PermissionAssignmentAuthorizationRuleset;
	@inject(INJECTABLE_TYPES.RoleAuthorizationRuleset)
	roleAuthorizationRuleset: RoleAuthorizationRuleset;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	@inject(INJECTABLE_TYPES.RepositoryMapper)
	mapper: RepositoryMapper;

	grantUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string
	): Promise<DomainEntity> => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const user = await unitOfWork.userRepository.findOne([new FilterCondition("_id", userId)]);
		if (!user) {
			throw new Error(`User with id ${userId} does not exist`);
		}
		await this.grantEntityPermission(
			unitOfWork,
			context,
			permission,
			subjectId,
			subjectType,
			user,
			unitOfWork.userRepository
		);
		const subject = this.mapper.map(subjectType).findById(subjectId);
		await unitOfWork.commit();
		return subject;
	};

	revokeUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		userId: string
	): Promise<DomainEntity> => {
		const unitOfWork = this.dbUnitOfWorkFactory();
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
		const subject = this.mapper.map(permissionAssignment.subjectType).findById(subjectId);
		await unitOfWork.commit();
		return subject;
	};

	grantRolePermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		roleId: string
	): Promise<Role> => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const role = await unitOfWork.roleRepository.findOne([new FilterCondition("_id", roleId)]);
		if (!role) {
			throw new Error(`Role with id ${roleId} does not exist`);
		}
		await this.grantEntityPermission(
			unitOfWork,
			context,
			permission,
			subjectId,
			subjectType,
			role,
			unitOfWork.roleRepository
		);
		await unitOfWork.commit();
		return role;
	};

	revokeRolePermission = async (
		context: SecurityContext,
		roleId: string,
		permission: string,
		subjectId: string
	): Promise<Role> => {
		const unitOfWork = this.dbUnitOfWorkFactory();
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
		await unitOfWork.commit();
		return role;
	};

	createRole = async (context: SecurityContext, worldId: string, name: string): Promise<World> => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!(await context.hasPermission(ROLE_ADD, worldId))) {
			throw new Error(`You do not have permission to add roles to this world`);
		}
		const newRole = this.roleFactory(null, name, worldId, []);
		await unitOfWork.roleRepository.create(newRole);
		world.roles.push(newRole._id);
		await unitOfWork.worldRepository.update(world);
		for (let permission of [ROLE_ADMIN, ROLE_RW]) {
			const permissionAssignment = this.permissionAssignmentFactory(
				null,
				permission,
				newRole._id,
				ROLE
			);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			context.user.permissions.push(permissionAssignment._id);
		}
		await unitOfWork.userRepository.update(context.user);
		await unitOfWork.commit();
		return world;
	};

	deleteRole = async (context: SecurityContext, roleId: string): Promise<World> => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const role = await unitOfWork.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}
		if (!(await this.roleAuthorizationRuleset.canWrite(context, role))) {
			throw new Error(`You do not have write permissions for this role`);
		}
		if (role.name === WORLD_OWNER || role.name === EVERYONE || role.name === LOGGED_IN) {
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
		const unitOfWork = this.dbUnitOfWorkFactory();
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
		const unitOfWork = this.dbUnitOfWorkFactory();
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

	private grantEntityPermission = async (
		unitOfWork: UnitOfWork,
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		entity: User | Role,
		entityRepository: Repository<any>
	) => {
		let assignment: PermissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
			new FilterCondition("permission", permission),
			new FilterCondition("subject", subjectId),
			new FilterCondition("subjectType", subjectType),
		]);
		let needsCreation = false;
		if (!assignment) {
			assignment = this.permissionAssignmentFactory(null, permission, subjectId, subjectType);
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
		// check if entity already has that permission
		for (let entityPermission of entity.permissions) {
			if (entityPermission === assignment._id) {
				return;
			}
		}
		entity.permissions.push(assignment._id);
		await entityRepository.update(entity);
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
		if (
			!(await this.permissionAssignmentAuthorizationRuleset.canWrite(context, permissionAssignment))
		) {
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
