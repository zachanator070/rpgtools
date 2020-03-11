import mongoose from 'mongoose';
import mongooseAutopopulate from 'mongoose-autopopulate';
import {SERVER_CONFIG, USER} from "../../type-constants";

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

serverSchema.plugin(mongooseAutopopulate);

export const ServerConfig = mongoose.model(SERVER_CONFIG, serverSchema);
