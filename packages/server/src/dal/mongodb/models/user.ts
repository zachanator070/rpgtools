import mongoose, {Schema} from "mongoose";
import {ROLE, USER, WORLD} from "@rpgtools/common/src/type-constants";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import {MongoDBDocument} from "../../../types";

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
});

export interface UserDocument extends MongoDBDocument {
    email: string;
    username: string;
    password: string;
    tokenVersion: string;
    currentWorld: Schema.Types.ObjectId;
    roles: Schema.Types.ObjectId[];
}

export const UserModel = mongoose.model<UserDocument>(USER, userSchema);
