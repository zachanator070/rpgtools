import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = Schema({
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
	currentWorld: {
		type: mongoose.Schema.ObjectId,
		ref: 'World'
	}
});

const User = mongoose.model('User', userSchema);

export default User;
