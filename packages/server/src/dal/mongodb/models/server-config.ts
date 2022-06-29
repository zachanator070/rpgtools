import mongoose from "mongoose";
import { SERVER_CONFIG, USER } from "@rpgtools/common/src/type-constants";
import { ServerConfigDocument } from "../../../types";

const serverSchema = new mongoose.Schema({
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
			type: mongoose.Schema.Types.ObjectId,
			ref: USER,
		},
	],
	unlockCode: {
		type: String,
	},
});

export const ServerConfigModel = mongoose.model<ServerConfigDocument>(SERVER_CONFIG, serverSchema);
