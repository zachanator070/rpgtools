import { injectable } from "inversify";

import fetch from "node-fetch";

export class Open5eMonster {
	name: string;
	strength_save: number;
	dexterity_save: number;
	constitution_save: number;
	intelligence_save: number;
	wisdom_save: number;
	charisma_save: number;
	size: string;
	type: string;
	alignment: string;
	armor_class: number;
	hit_points: number;
	hit_dice: string;
	speed: any;
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
	skills: { [key: string]: number };
	senses: string;
	languages: string;
	challenge_rating: number;
	special_abilities: { name: string; desc: string }[];
	actions: { name: string; desc: string }[];
	legendary_actions: { name: string; desc: string }[];
	document__slug: string;
	img_main: string;
}

export class Open5eRace {
	name: string;
	desc: string;
	asi_desc: string;
	age: string;
	alignment: string;
	size: string;
	speed_desc: string;
	languages: string;
	vision: string;
	traits: string;
	subraces: { name: string; asi_desc: string; traits: string; desc: string }[];
}

export class Open5eClass {
	hit_dice: string;
	hp_at_1st_level: string;
	hp_at_higher_levels: string;
	prof_armor: string;
	prof_weapons: string;
	prof_tools: string;
	prof_saving_throws: string;
	prof_skills: string;
	equipment: string;
	subtypes_name: string;
	archetypes: { name: string; desc: string }[];
	name: string;
	table: string;
	desc: string;
}

export class Open5eSpell {
	level: string;
	school: string;
	dnd_class: string;
	range: string;
	casting_time: string;
	components: string;
	material: string;
	ritual: string;
	duration: string;
	concentration: string;
	desc: string;
	higher_level: string;
	name: string;
}

export class Open5eSection {
	name: string;
	desc: string;
	parent: string;
}

export class Open5eRule {
	name: string;
	desc: string;
	subsections: { name: string; index: string }[];
}

export class Open5eRuleSection {
	name: string;
	desc: string;
}

const BASE_URL = "https://api.open5e.com";

@injectable()
export class Open5eApiClient {
	getPages = async function* (resource: string) {
		try {
			let next = BASE_URL + resource;

			while (next) {
				const response = await fetch(next);
				if (!response.ok) {
					console.warn(response.ok);
					throw new Error(`Error while fetching open5e resource ${resource}`);
				}
				const json = await response.json();
				let results = json.results;
				for (let result of results) {
					yield result;
				}
				next = json.next;
			}
		} catch (e) {
			console.warn(e.message);
		}
	};

	getPage = async (resource: string) => {
		try {
			let next = BASE_URL + resource;
			const response = await fetch(next);
			if (!response.ok) {
				console.warn(response.ok);
				throw new Error(`Error while fetching open5e resource ${resource}`);
			}
			return response.json();
		} catch (e) {
			console.warn(e.message);
		}
	};

	public getMonsters = (): AsyncGenerator<Open5eMonster> => {
		return this.getPages("/monsters/");
	};

	public getAdventuringSections = (): AsyncGenerator<Open5eSection> => {
		return this.getPages("/sections/");
	};

	public getRaces = (): AsyncGenerator<Open5eRace> => {
		return this.getPages("/races/");
	};

	public getClasses = (): AsyncGenerator<Open5eClass> => {
		return this.getPages("/classes/");
	};

	public getSpells = (): AsyncGenerator<Open5eSpell> => {
		return this.getPages("/spells/");
	};

	public getMagicItems = () => {
		return this.getPages("/magicitems/");
	};

	public searchSpells = (term: string): AsyncGenerator<Open5eSpell> => {
		return this.getPages(`/spells/?search=${term}`);
	};

	public getRules = (): AsyncGenerator<Open5eRule> => {
		return this.getPages("/rules/");
	};

	public getRuleSubSection = async (index: string): Promise<Open5eRuleSection> => {
		return this.getPage(`/rule-sections/${index}`);
	};
}
