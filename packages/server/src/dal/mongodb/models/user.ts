import mongoose from "mongoose";
import { PERMISSION_ASSIGNMENT, ROLE, USER, WORLD } from "../../../../../common/src/type-constants";
import { ANON_USERNAME } from "../../../../../common/src/permission-constants";
import { UserDocument } from "../../../types";

const userSchema = new mongoose.Schema({
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
		type: mongoose.Schema.Types.ObjectId,
		ref: WORLD,
	},
	roles: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: ROLE,
		},
	],
	permissions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: PERMISSION_ASSIGNMENT,
			index: true,
		},
	],
});

export const UserModel = mongoose.model<UserDocument>(USER, userSchema);