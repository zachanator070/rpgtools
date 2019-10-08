import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const worldSchema = Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	readUsers: [{
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	}],
	writeUsers: [{
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	}],
	public: Boolean,
	owner: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'owner field required'],
		ref: 'User'
	},
	wikiPage: {
		type: mongoose.Schema.ObjectId,
		ref: 'WikiPage'
	},
	rootFolder: {
		type: mongoose.Schema.ObjectId,
		ref: 'WikiFolder'
	}
});

const World = mongoose.model('World', worldSchema);

export default World;
