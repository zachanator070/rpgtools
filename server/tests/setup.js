
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

process.env.ACCESS_TOKEN_SECRET = 'asdf1234';
process.env.REFRESH_TOKEN_SECRET = 'asdf1234';

beforeEach(async function(done) {
	/*
	  Define clearDB function that will loop through all
	  the collections in our mongoose connection and drop them.
	*/
	async function clearDB() {

		const collections = await mongoose.connection.db.listCollections().toArray();
		for(let collection of collections){
			try{
				await mongoose.connection.db.dropCollection(collection.name);
			}
			catch (e) {
				console.log(`error while clearing collections: ${e.message}`);
			}

		}
	}

	/*
	  If the mongoose connection is closed,
	  start it up using the test url and database name
	  provided by the node runtime ENV
	*/
	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(
			`mongodb://localhost:27017/${process.env.TEST_SUITE}`,
		{
					useNewUrlParser: true,
					useUnifiedTopology: true
				}
			);
		await clearDB();
	} else {
		await clearDB();
	}

	return done();
});

afterEach(async function(done) {
	await mongoose.disconnect();
	return done();
});

afterAll(done => {
	return done();
});