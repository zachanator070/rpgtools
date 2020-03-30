
import {ServerConfig} from '../../models/server-config';
import {registerUser} from "./authentication-mutations";
import {checkConfig} from "../../server-needs-setup";
import { v4 as uuidv4 } from 'uuid';

export const serverMutations = {
	unlockServer: async (_, {unlockCode, email, username, password}) => {
		const server = await ServerConfig.findOne();
		if(!server){
			throw new Error('Server config doesnt exist!');
		}
		if(server.unlockCode !== unlockCode){
			throw new Error('Unlock code is incorrect');
		}
		if(server.adminUsers.length > 0){
			throw new Error('Server is already unlocked');
		}
		const admin = await registerUser(email, username, password);
		server.adminUsers.push(admin);
		await server.save();
		await checkConfig();
		return true;
	},
	generateRegisterCodes: async (_, {amount}, {currentUser}) => {
		const server = await ServerConfig.findOne();
		if(!server){
			throw new Error('Server config doesnt exist!');
		}
		if(server.adminUsers.findIndex(admin => admin.equals(currentUser._id)) < 0){
			throw new Error('You do not have permission to call this method');
		}
		const newCodes = Array(amount).fill('').map(() => uuidv4());
		server.registerCodes = server.registerCodes.concat(newCodes);
		await server.save();
		return server;
	}
};