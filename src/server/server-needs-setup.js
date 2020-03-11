import {ServerConfig} from "./models/server-config";

let needsSetup = false;

export const checkConfig = async () => {
	let server = await ServerConfig.findOne();
	if(server.adminUsers.length === 0){
		needsSetup = true;
	}
};

export const serverNeedsSetup = () => {
	return needsSetup;
};
