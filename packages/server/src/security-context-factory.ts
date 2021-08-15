import { ALL_USERS, EVERYONE } from "../../common/src/role-constants";
import { User } from "./domain-entities/user";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "./injectable-types";
import { Repository } from "./types";
import { PermissionAssignment } from "./domain-entities/permission-assignment";
import { FilterCondition } from "./dal/filter-condition";
import { Role } from "./domain-entities/role";
import { SecurityContext } from "./security-context";
import {ANON_USERNAME} from "../../common/src/permission-constants";

@injectable()
export class SecurityContextFactory {
	@inject(INJECTABLE_TYPES.PermissionAssignmentRepository)
	permissionAssignmentRepository: Repository<PermissionAssignment>;
	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: Repository<Role>;

	getUserPermissions = async (user: User): Promise<PermissionAssignment[]> => {
		const allPermissions = [];
		for (let permissionId of user.permissions) {
			const permission = await this.permissionAssignmentRepository.findOne([
				new FilterCondition("_id", permissionId),
			]);
			allPermissions.push(permission);
		}
		return allPermissions;
	};

	getRolePermissions = async (user: User): Promise<PermissionAssignment[]> => {
		const allPermissions = [];
		const roles = await this.getRoles(user);
		for (let role of roles) {
			for (let permissionId of role.permissions) {
				const permission = await this.permissionAssignmentRepository.findOne([
					new FilterCondition("_id", permissionId),
				]);
				allPermissions.push(permission);
			}
		}
		return allPermissions;
	};

	getEveryonePermissions = async (): Promise<PermissionAssignment[]> => {
		const allPermissions = [];
		const roles: Role[] = await this.roleRepository.find([new FilterCondition("name", EVERYONE)]);
		for (let role of roles) {
			for (let permissionId of role.permissions) {
				const permission = await this.permissionAssignmentRepository.findOne([
					new FilterCondition("_id", permissionId),
				]);
				allPermissions.push(permission);
			}
		}
		return allPermissions;
	};

	getAllUserPermissions = async (): Promise<PermissionAssignment[]> => {
		const allPermissions: PermissionAssignment[] = [];
		const role: Role = await this.roleRepository.findOne([new FilterCondition("name", ALL_USERS)]);
		for (let permissionId of role.permissions) {
			const permission = await this.permissionAssignmentRepository.findOne([
				new FilterCondition("_id", permissionId),
			]);
			allPermissions.push(permission);
		}
		return allPermissions;
	};

	getRoles = async (user: User): Promise<Role[]> => {
		const roles: Role[] = [];
		for (let roleId of user.roles) {
			roles.push(await this.roleRepository.findOne([new FilterCondition("_id", roleId)]));
		}
		return roles;
	};

	create = async (user: User): Promise<SecurityContext> => {
		const allPermissions = [];
		// if the user is logged in, calculate permissions for their user, role, and those given to all logged in users
		if(user.username !== ANON_USERNAME){
			allPermissions.push(...(await this.getAllUserPermissions()));
			allPermissions.push(...(await this.getRolePermissions(user)));
			allPermissions.push(...(await this.getUserPermissions(user)));
		}
		allPermissions.push(...(await this.getEveryonePermissions()));
		const roles = await this.getRoles(user);
		return new SecurityContext(user, allPermissions, roles);
	};
}
