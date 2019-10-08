const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wikiPageSchema = Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	type: {
		type: String,
		enum: ['person', 'place', 'item', 'ability', 'spell', 'article', 'monster'],
		required: [true, 'type required']
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
	mapImage: {
		type: mongoose.Schema.ObjectId,
		validate: {
			validator: (v) => {
				return this.type === 'place';
			},
			message: props => 'Can only set a map to a place'
		},
		ref: 'Image'
	},
	content: Object
});

const WikiPage = mongoose.model('WikiPage', wikiPageSchema);

module.exports = WikiPage;
