import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const wikiPageSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	world: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'world field required'],
		ref: 'World'
	},
	coverImage: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image'
	},
	content: String,
});
export const WikiPage = mongoose.model('WikiPage', wikiPageSchema);
