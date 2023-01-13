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
		{ securityContext, databaseContext }: SessionContext
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
			databaseContext
		);
	},
	revokeUserPermission: async (
		_: any,
		{ userId, permission, subjectId, subjectType }: { userId: string; permission: string; subjectId: string, subjectType: string},
		{ securityContext, databaseContext }: SessionContext
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
			databaseContext
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
		{ securityContext, databaseContext }: SessionContext
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
			databaseContext
		);
	},
	revokeRolePermission: async (
		_: any,
		{ roleId, permission, subjectId, subjectType }: { roleId: string; permission: string; subjectId: string, subjectType: string },
		{ securityContext, databaseContext }: SessionContext
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
			databaseContext
		);
	},
	createRole: async (
		_: any,
		{ worldId, name }: { worldId: string; name: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.createRole(securityContext, worldId, name, databaseContext);
	},
	deleteRole: async (
		_: any,
		{ roleId }: { roleId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.deleteRole(securityContext, roleId, databaseContext);
	},
	addUserRole: async (
		_: any,
		{ userId, roleId }: { userId: string; roleId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.addUserRole(securityContext, userId, roleId, databaseContext);
	},
	removeUserRole: async (
		_: any,
		{ userId, roleId }: { userId: string; roleId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const authorizationService = container.get<AuthorizationService>(
			INJECTABLE_TYPES.AuthorizationService
		);
		return await authorizationService.removeUserRole(securityContext, userId, roleId, databaseContext);
	},
};
