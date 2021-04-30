import mongoose from "mongoose";
import { SERVER_CONFIG, USER } from "../../../common/src/type-constants";
import { SERVER_ADMIN, SERVER_RW } from "../../../common/src/permission-constants";

const Schema = mongoose.Schema;

const serverSchema = new Schema({
	version: {
		type: String,
		required: true,
	},
	registerCodes: [
		{
			type: String,
		},
	],
	adminUsers: [
		{
			type: mongoose.Schema.ObjectId,
			ref: USER,
		},
	],
	unlockCode: {
		type: String,
	},
});

serverSchema.methods.userCanAdmin = async function (user) {
	return await user.hasPermission(SERVER_ADMIN, this._id);
};

serverSchema.methods.userCanWrite = async function (user) {
	return await user.hasPermission(SERVER_RW, this._id);
};

serverSchema.methods.userCanRead = async function (user) {
	return (await this.userCanAdmin(user)) || (await this.userCanWrite(user));
};

export const ServerConfig = mongoose.model(SERVER_CONFIG, serverSchema);
