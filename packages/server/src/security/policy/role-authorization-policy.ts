import {EntityAuthorizationPolicy, UnitOfWork} from "../../types";
import { Role } from "../../domain-entities/role";
import { SecurityContext } from "../security-context";
import {
	ROLE_ADD,
	ROLE_ADMIN,
	ROLE_ADMIN_ALL,
	ROLE_READ,
	ROLE_READ_ALL,
	ROLE_RW,
	ROLE_RW_ALL,
} from "@rpgtools/common/src/permission-constants";
import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants";

import { injectable } from "inversify";

@injectable()
export class RoleAuthorizationPolicy implements EntityAuthorizationPolicy<Role> {
	entity: Role;

	canAdmin = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return (
			context.hasPermission(ROLE_ADMIN, this.entity) ||
			context.hasPermission(ROLE_ADMIN_ALL, world)
		);
	};

	canCreate = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return context.hasPermission(ROLE_ADD, world);
	};

	canRead = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return (
			(await this.canWrite(context, unitOfWork)) ||
			context.hasPermission(ROLE_READ, this.entity) ||
			context.hasPermission(ROLE_READ_ALL, world) ||
			context.hasRole(this.entity.name) ||
			this.entity.name === EVERYONE ||
			this.entity.name === LOGGED_IN
		);
	};

	canWrite = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return (
			context.hasPermission(ROLE_RW, this.entity) || context.hasPermission(ROLE_RW_ALL, world)
		);
	};
}
