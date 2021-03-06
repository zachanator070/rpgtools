import { ServerConfig } from "../../models/server-config";
import { registerUser } from "./authentication-mutations";
import { checkConfig } from "../../server-needs-setup";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../models/role";
import {
	SERVER_ADMIN_ROLE,
	SERVER_PERMISSIONS,
} from "@rpgtools/common/src/permission-constants";
import { PermissionAssignment } from "../../models/permission-assignement";
import { SERVER_CONFIG } from "@rpgtools/common/src/type-constants";

export const serverMutations = {
	unlockServer: async (_, { unlockCode, email, username, password }) => {
		const server = await ServerConfig.findOne();
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (server.unlockCode !== unlockCode) {
			throw new Error("Unlock code is incorrect");
		}
		if (server.adminUsers.length > 0) {
			throw new Error("Server is already unlocked");
		}
		const admin = await registerUser(email, username, password);
		const adminRole = await Role.create({ name: SERVER_ADMIN_ROLE });
		for (let permission of SERVER_PERMISSIONS) {
			const permissionAssignment = await PermissionAssignment.create({
				permission,
				subject: server,
				subjectType: SERVER_CONFIG,
			});
			adminRole.permissions.push(permissionAssignment);
		}
		await adminRole.save();
		admin.roles.push(adminRole);
		await admin.save();
		await server.save();
		await checkConfig();
		return true;
	},
	generateRegisterCodes: async (_, { amount }, { currentUser }) => {
		const server = await ServerConfig.findOne();
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await server.userCanWrite(currentUser))) {
			throw new Error("You do not have permission to call this method");
		}
		const newCodes = Array(amount)
			.fill("")
			.map(() => uuidv4());
		server.registerCodes = server.registerCodes.concat(newCodes);
		await server.save();
		return server;
	},
};
