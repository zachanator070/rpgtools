
import {ServerConfig} from '../../models/server-config';
import {registerUser} from "./authentication-mutations";
import {checkConfig} from "../../server-needs-setup";

export const serverMutations = {
	unlockServer: async (_, {unlockCode, email, username, password}, {currentUser}) => {
		const server = await ServerConfig.findOne();
		if(!server){
			throw new Error('Server config doesnt exist!');
		}
		if(server.unlockCode !== unlockCode){
			throw new Error('Unlock code is incorrect');
		}
		const admin = await registerUser(email, username, password);
		server.adminUsers.push(admin);
		await server.save();
		await checkConfig();
		return true;
	}
};