
const fetch = require('node-fetch');

const BASE_URL = 'https://api.open5e.com';

const get  = async function* (resource){
	try{
		let next = BASE_URL + resource;

		while(next){
			const response = await fetch(next);
			if(!response.ok){
				throw new Error(`Error while fetching open5e resource ${resource}`);
			}
			const json = await response.json();
			let results = json.results;
			for(let result of results){
				yield result;
			}
			next = json.next;
		}
	}
	catch (e){
		console.warn(e.message);
	}
}

export const getMonsters = async () => {
	const monsters = get('/monsters/');
	let count = 0;

	for await (let monster of monsters){
		count ++;
	}
	console.log(count);
}
