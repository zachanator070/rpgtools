import { AuthorizationService, SessionContext } from "../../types";
import { container } from "../../inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";

export const authorizationMutations = {
	grantUserPermission: async (
		_: any,
		{
			userId,
			permission,
			subjectId,
			subjectType,
		}: { userId: string; permission: string; subjectId: string; subjectType: string },
		{ securityContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.grantUserPermission(
			securityContext,
			permission,
			subjectId,
			subjectType,
			userId
		);
	},
	revokeUserPermission: async (
		_: any,
		{ userId, permission, subjectId }: { userId: string; permission: string; subjectId: string },
		{ securityContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.revokeUserPermission(
			securityContext,
			permission,
			subjectId,
			userId
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
		{ securityContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.grantRolePermission(
			securityContext,
			permission,
			subjectId,
			subjectType,
			roleId
		);
	},
	revokeRolePermission: async (
		_: any,
		{ roleId, permission, subjectId }: { roleId: string; permission: string; subjectId: string },
		{ securityContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.revokeRolePermission(
			securityContext,
			roleId,
			permission,
			subjectId
		);
	},
	createRole: async (
		_: any,
		{ worldId, name }: { worldId: string; name: string },
		{ securityContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.createRole(securityContext, worldId, name);
	},
	deleteRole: async (
		_: any,
		{ roleId }: { roleId: string },
		{ securityContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.deleteRole(securityContext, roleId);
	},
	addUserRole: async (
		_: any,
		{ userId, roleId }: { userId: string; roleId: string },
		{ securityContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.addUserRole(securityContext, userId, roleId);
	},
	removeUserRole: async (
		_: any,
		{ userId, roleId }: { userId: string; roleId: string },
		{ securityContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.removeUserRole(securityContext, userId, roleId);
	},
};
