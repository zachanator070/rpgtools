import mongoose from "mongoose";
import {ROLE, USER, WORLD} from "@rpgtools/common/src/type-constants";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import {MongoDBDocument} from "../../../types";
import {v4} from "uuid";

const userSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: v4
	},
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
		type: String,
		ref: WORLD,
	},
	roles: [
		{
			type: String,
			ref: ROLE,
		},
	],
});

export interface UserDocument extends MongoDBDocument {
    email: string;
    username: string;
    password: string;
    tokenVersion: string;
    currentWorld: string;
    roles: string[];
}

export const UserModel = mongoose.model<UserDocument>(USER, userSchema);
