const fetch = require("node-fetch");

const BASE_URL = "https://www.dnd5eapi.co";

const getPage = async (resource) => {
	const response = await fetch(BASE_URL + resource);
	if (!response.ok) {
		console.warn(response.ok);
		throw new Error(`Error while fetching open5e resource ${resource}`);
	}
	return await response.json();
};

const getPages = async (resource) => {
	try {
		const results = await getPage(resource);
		const pages = [];
		for(let result of results.results){
			pages.push(await getPage(result.url));
		}
		return pages;
	} catch (e) {
		console.warn(e.message);
	}
};

export const getRules = async (rulesToGet) => {
	const rules = [];
	for(let ruleToGet of rulesToGet){
		const rule = await getPage("/api/rules/" + ruleToGet);
		const subsections = [];
		for(let section of rule.subsections){
			subsections.push(await getPage(section.url));
		}
		rule.subsections = subsections;
		rules.push(rule);
	}
	return rules;
};
