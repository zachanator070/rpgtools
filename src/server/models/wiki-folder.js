import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const wikiFolderSchema = Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	world: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'world field required'],
		ref: 'World'
	},
	pages: [{
		type: mongoose.Schema.ObjectId,
		ref: 'WikiPage'
	}],
	children: [{
		type: mongoose.Schema.ObjectId,
		ref: 'WikiFolder'
	}]
});

export const WikiFolder = mongoose.model('WikiFolder', wikiFolderSchema);

