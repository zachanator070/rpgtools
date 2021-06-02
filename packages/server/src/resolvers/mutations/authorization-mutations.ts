import { SessionContext } from "../../types";

export const authorizationMutations = {
	grantUserPermission: async (
		_: any,
		{
			userId,
			permission,
			subjectId,
			subjectType,
		}: { userId: string; permission: string; subjectId: string; subjectType: string },
		{ securityContext, authorizationService }: SessionContext
	) => {
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
		{ securityContext, authorizationService }: SessionContext
	) => {
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
		{ securityContext, authorizationService }: SessionContext
	) => {
		return await authorizationService.grantRolePermission(
			securityContext,
			roleId,
			permission,
			subjectId,
			subjectType
		);
	},
	revokeRolePermission: async (
		_: any,
		{ roleId, permission, subjectId }: { roleId: string; permission: string; subjectId: string },
		{ securityContext, authorizationService }: SessionContext
	) => {
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
		{ securityContext, authorizationService }: SessionContext
	) => {
		return await authorizationService.createRole(securityContext, worldId, name);
	},
	deleteRole: async (
		_: any,
		{ roleId }: { roleId: string },
		{ securityContext, authorizationService }: SessionContext
	) => {
		await authorizationService.deleteRole(securityContext, roleId);
	},
	addUserRole: async (
		_: any,
		{ userId, roleId }: { userId: string; roleId: string },
		{ securityContext, authorizationService }: SessionContext
	) => {
		return await authorizationService.addUserRole(securityContext, userId, roleId);
	},
	removeUserRole: async (
		_: any,
		{ userId, roleId }: { userId: string; roleId: string },
		{ securityContext, authorizationService }: SessionContext
	) => {
		return await authorizationService.removeUserRole(securityContext, userId, roleId);
	},
};
