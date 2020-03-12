import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'
import mongooseAutopopulate from 'mongoose-autopopulate';
import {PERMISSION_ASSIGNMENT, ROLE, USER, WORLD} from "../../type-constants";

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: [true, 'email field required']
	},
	username: {
		type: String,
		required: [true, 'username field required']
	},
	password: {
		type: String,
		required: [true, 'password missing']
	},
	tokenVersion: {
		type: String
	},
	currentWorld: {
		type: mongoose.Schema.ObjectId,
		ref: WORLD
	},
	roles: [{
		type: mongoose.Schema.ObjectId,
		ref: ROLE,
		autopopulate: true,
	}],
	permissions: [{
		type: mongoose.Schema.ObjectId,
		ref: PERMISSION_ASSIGNMENT,
		autopopulate: true,
	}]
});

userSchema.plugin(mongooseAutopopulate);
userSchema.plugin(mongoosePaginate);

export const User = mongoose.model(USER, userSchema);
