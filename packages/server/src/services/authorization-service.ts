import {
	DomainEntity, PermissionControlledEntity,
	RoleFactory,
	UnitOfWork,
} from "../types";
import { SecurityContext } from "../security/security-context";
import { FilterCondition } from "../dal/filter-condition";
import { Role } from "../domain-entities/role";
import { ROLE_ADD, ROLE_ADMIN, ROLE_RW } from "@rpgtools/common/src/permission-constants";
import {ROLE, USER} from "@rpgtools/common/src/type-constants";
import {EVERYONE, LOGGED_IN, WORLD_OWNER} from "@rpgtools/common/src/role-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { User } from "../domain-entities/user";
import EntityMapper from "../domain-entities/entity-mapper";

@injectable()
export class AuthorizationService {

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

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
			USER,
		);
		return this.mapper.map(subjectType).getRepository(unitOfWork).findById(subjectId);
	};

	revokeUserPermission = async (
		context: SecurityContext,
		permission: string,
		subjectId: string,
		subjectType: string,
		userId: string,
		unitOfWork: UnitOfWork
	): Promise<DomainEntity> => {
		const user = await unitOfWork.userRepository.findOne([new FilterCondition("_id", userId)]);
		if (!user) {
			throw new Error("User does not exist");
		}
		return await this.revokeEntityPermission(
			unitOfWork,
			context,
			permission,
			subjectId,
			subjectType,
			user,
			USER,
		);
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
			ROLE,
		);
		return role;
	};

	revokeRolePermission = async (
		context: SecurityContext,
		roleId: string,
		permission: string,
		subjectId: string,
		subjectType: string,
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
			subjectType,
			role,
			ROLE,
		);
		return role;
	};

	createRole = async (context: SecurityContext, worldId: string, name: string, unitOfWork: UnitOfWork): Promise<Role> => {
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!context.hasPermission(ROLE_ADD, world)) {
			throw new Error(`You do not have permission to add roles to this world`);
		}
		const newRole = this.roleFactory({_id: null, name, world: worldId, acl: []});
		await unitOfWork.roleRepository.create(newRole);
		for (let permission of [ROLE_ADMIN, ROLE_RW]) {
			newRole.acl.push({
				permission,
				principal: context.user._id,
				principalType: USER
			});
		}
		await unitOfWork.userRepository.update(context.user);
		return newRole;
	};

	deleteRole = async (context: SecurityContext, roleId: string, unitOfWork: UnitOfWork): Promise<Role> => {
		const role = await unitOfWork.roleRepository.findById(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} doesn't exist`);
		}
		if (!(await role.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have write permissions for this role`);
		}
		if (role.name === WORLD_OWNER || role.name === EVERYONE || role.name === LOGGED_IN) {
			throw new Error("You cannot delete this role");
		}
		const usersWithRole = await unitOfWork.userRepository.find([new FilterCondition('role', role._id)]);
		for(let user of usersWithRole) {
			user.roles = user.roles.filter(id => id !== role._id);
			await unitOfWork.userRepository.update(user);
		}
		await unitOfWork.roleRepository.delete(role);
		return role;
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

		if (!(await role.authorizationPolicy.canWrite(context, unitOfWork))) {
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

		if (!(await role.authorizationPolicy.canWrite(context, unitOfWork))) {
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
		entityId: string,
		entityType: string,
		principal: User | Role,
		principalType: "User" | "Role"
	) => {
		const entityRepository = this.mapper.map(entityType).getRepository(unitOfWork);
		const entity: DomainEntity = await entityRepository.findById(entityId);
		if (!(await entity.authorizationPolicy.canAdmin(context, unitOfWork))) {
			throw new Error(
				`You do not have permission to assign the permission "${permission}" for this subject`
			);
		}
		(entity as PermissionControlledEntity).acl.push({
			permission,
			principal: principal._id,
			principalType: principalType
		})
		await entityRepository.update(entity);

	};

	private revokeEntityPermission = async (
		unitOfWork: UnitOfWork,
		context: SecurityContext,
		permission: string,
		entityId: string,
		entityType: string,
		principal: User | Role,
		principalType: 'User' | 'Role'
	): Promise<PermissionControlledEntity> => {
		const entityRepository = this.mapper.map(entityType).getRepository(unitOfWork);
		const entity: DomainEntity = await entityRepository.findById(entityId);
		if (!(await entity.authorizationPolicy.canAdmin(context, unitOfWork))) {
			throw new Error(
				`You do not have permission to revoke the permission "${permission}"`
			);
		}

		(entity as PermissionControlledEntity).acl = (entity as PermissionControlledEntity).acl.filter(entry => entry.principalType !== principalType || entry.principal === principal._id)

		await entityRepository.update(entity);
		return (entity as PermissionControlledEntity);
	};
}
