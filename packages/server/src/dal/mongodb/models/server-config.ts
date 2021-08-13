import mongoose, { Schema } from "mongoose";
import { SERVER_CONFIG, USER } from "../../../../../common/src/type-constants";
import { ServerConfigDocument } from "../../../types";

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
			type: Schema.Types.ObjectId,
			ref: USER,
		},
	],
	unlockCode: {
		type: String,
	},
});

export const ServerConfigModel = mongoose.model<ServerConfigDocument>(SERVER_CONFIG, serverSchema);
