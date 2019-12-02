import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const roleSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	world: {
		type: mongoose.Schema.ObjectId,
		ref: 'World'
	},
	permissions: [{
		type: mongoose.Schema.ObjectId,
		ref: 'PermissionAssignment'
	}]
});

export const Role = mongoose.model('Role', roleSchema);
