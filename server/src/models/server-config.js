import mongoose from 'mongoose';
import {SERVER_CONFIG, USER} from "../../../common/type-constants";

const Schema = mongoose.Schema;

const serverSchema = new Schema({
	version: {
		type: String,
		required: true
	},
	registerCodes: [{
		type: String
	}],
	adminUsers: [{
		type: mongoose.Schema.ObjectId,
		ref: USER
	}],
	unlockCode: {
		type: String
	}
});

export const ServerConfig = mongoose.model(SERVER_CONFIG, serverSchema);
