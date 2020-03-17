import {ServerConfig} from "./models/server-config";

let needsSetup = false;

export const checkConfig = async () => {
	let server = await ServerConfig.findOne();
	needsSetup = server.adminUsers.length === 0;
};

export const serverNeedsSetup = () => {
	return needsSetup;
};
