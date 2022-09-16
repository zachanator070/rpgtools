import { SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import {AuthorizationService} from "../../services/authorization-service";

export const authorizationMutations = {
	grantUserPermission: async (
		_: any,
		{
			userId,
			permission,
			subjectId,
			subjectType,
		}: { userId: string; permission: string; subjectId: string; subjectType: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.grantUserPermission(
			securityContext,
			permission,
			subjectId,
			subjectType,
			userId,
			unitOfWork
		);
	},
	revokeUserPermission: async (
		_: any,
		{ userId, permission, subjectId, subjectType }: { userId: string; permission: string; subjectId: string, subjectType: string},
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.revokeUserPermission(
			securityContext,
			permission,
			subjectId,
			subjectType,
			userId,
			unitOfWork
		);
	},
	grantRolePermission: async (
		_: any,
		{
			roleId,
			permission,
			subjectId,
			subjectType,
		}: { roleId: string; permission: string; subjectId: string; subjectType: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.grantRolePermission(
			securityContext,
			permission,
			subjectId,
			subjectType,
			roleId,
			unitOfWork
		);
	},
	revokeRolePermission: async (
		_: any,
		{ roleId, permission, subjectId, subjectType }: { roleId: string; permission: string; subjectId: string, subjectType: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.revokeRolePermission(
			securityContext,
			roleId,
			permission,
			subjectId,
			subjectType,
			unitOfWork
		);
	},
	createRole: async (
		_: any,
		{ worldId, name }: { worldId: string; name: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.createRole(securityContext, worldId, name, unitOfWork);
	},
	deleteRole: async (
		_: any,
		{ roleId }: { roleId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.deleteRole(securityContext, roleId, unitOfWork);
	},
	addUserRole: async (
		_: any,
		{ userId, roleId }: { userId: string; roleId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.addUserRole(securityContext, userId, roleId, unitOfWork);
	},
	removeUserRole: async (
		_: any,
		{ userId, roleId }: { userId: string; roleId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.removeUserRole(securityContext, userId, roleId, unitOfWork);
	},
};
