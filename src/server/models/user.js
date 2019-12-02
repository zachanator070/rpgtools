import mongoose from 'mongoose';

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
		ref: 'World'
	},
	roles: [{
		type: mongoose.Schema.ObjectId,
		ref: 'Role'
	}],
	permissions: [{
		type: mongoose.Schema.ObjectId,
		ref: 'PermissionAssignment'
	}]
});

export const User = mongoose.model('User', userSchema);
