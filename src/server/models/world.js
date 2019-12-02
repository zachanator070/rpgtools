import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-aggregate-paginate-v2'
const Schema = mongoose.Schema;

const worldSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	wikiPage: {
		type: mongoose.Schema.ObjectId,
		ref: 'WikiPage'
	},
	rootFolder: {
		type: mongoose.Schema.ObjectId,
		ref: 'WikiFolder'
	},
	roles: [{
		type: mongoose.Schema.ObjectId,
		ref: 'Role'
	}]
});

worldSchema.plugin(mongoosePaginate);

export const World = mongoose.model('World', worldSchema);
