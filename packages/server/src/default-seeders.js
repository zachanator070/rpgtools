import { Role } from "./models/role";
import { PermissionAssignment } from "./models/permission-assignement";
import { ALL_USERS } from "../../common/src/role-constants";
import { WORLD_CREATE } from "../../common/src/permission-constants";
import { ServerConfig } from "./models/server-config";
import { SERVER_CONFIG } from "../../common/src/type-constants";
import { v4 as uuidv4 } from "uuid";

export const seedDefaultRoles = async () => {
	let allUsersRole = await Role.find({ name: ALL_USERS });
	if (allUsersRole.length === 0) {
		const server = await ServerConfig.findOne();
		if (!server) {
			throw new Error("Server needs to exist!");
		}
		allUsersRole = await Role.create({ name: ALL_USERS });
		let createWorldPermission = await PermissionAssignment.findOne({
			permission: WORLD_CREATE,
			subject: server._id,
			subjectType: SERVER_CONFIG,
		});
		if (!createWorldPermission) {
			createWorldPermission = await PermissionAssignment.create({
				permission: WORLD_CREATE,
				subject: server._id,
				subjectType: SERVER_CONFIG,
			});
		}
		allUsersRole.permissions.push(createWorldPermission._id);
		await allUsersRole.save();
		console.log(`Created default role "${ALL_USERS}"`);
	}
};

export const seedServer = async () => {
	let server = await ServerConfig.findOne();
	if (!server) {
		server = await ServerConfig.create({
			unlockCode: uuidv4(),
			version: "1.0",
		});
		console.log(`Created server config ${server._id}`);
		console.log(`====================================================`);
		console.log(`Server unlock code: ${server.unlockCode}`);
		console.log(`====================================================`);
	}
};

export const defaultSeeders = async () => {
	await seedServer();
	await seedDefaultRoles();
};
