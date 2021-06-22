import mongoose, { Schema } from "mongoose";
import { SERVER_CONFIG, USER } from "../../../../../common/src/type-constants";
import { MongoDBEntity } from "../../../types";

export class ServerConfigDocument extends MongoDBEntity {
	public version: string;
	public registerCodes: string[];
	public adminUsers: Schema.Types.ObjectId[];
	public unlockCode: string;
}

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
