import mongoose, { Schema } from "mongoose";
import { PERMISSION_ASSIGNMENT, ROLE, USER, WORLD } from "../../../../../common/src/type-constants";
import { ANON_USERNAME } from "../../../../../common/src/permission-constants";
import { MongoDBEntity } from "../../../types";

export class UserDocument extends MongoDBEntity {
	public email: string;
	public username: string;
	public password: string;
	public tokenVersion: string;
	public currentWorld: Schema.Types.ObjectId;
	public roles: Schema.Types.ObjectId[];
	public permissions: Schema.Types.ObjectId[];
}

const userSchema = new Schema({
	email: {
		type: String,
	},
	username: {
		type: String,
		required: [true, "username field required"],
		validate: [
			(username: string) => {
				return username !== ANON_USERNAME;
			},
			"cannot save anonymous user",
		],
	},
	password: {
		type: String,
	},
	tokenVersion: {
		type: String,
	},
	currentWorld: {
		type: Schema.Types.ObjectId,
		ref: WORLD,
	},
	roles: [
		{
			type: Schema.Types.ObjectId,
			ref: ROLE,
		},
	],
	permissions: [
		{
			type: Schema.Types.ObjectId,
			ref: PERMISSION_ASSIGNMENT,
			index: true,
		},
	],
});

export const UserModel = mongoose.model<UserDocument>(USER, userSchema);
