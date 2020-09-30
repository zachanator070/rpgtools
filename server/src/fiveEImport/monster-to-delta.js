

const getModifier = (score) => {
	return Math.floor((score - 10) /2);
}

const getSpecialAbilitiesDelta = (monster) => {
	const ops = [];
	if(monster.special_abilities.length > 0){
		ops.push(
			{
				"insert": "\n"
			},
			{
				"attributes": {
					"background": "transparent",
					"color": "#111111",
					"bold": true
				},
				"insert": "Special Abilities"
			},
			{
				"attributes": {
					"header": 2
				},
				"insert": "\n"
			},
		);
	}
	for(let ability of monster.special_abilities){
		ops.push(
			{
				"attributes": {
					"background": "transparent",
					"color": "#111111",
					"bold": true
				},
				"insert": ability.name
			},
			{
				"attributes": {
					"background": "transparent",
					"color": "#000000"
				},
				"insert": ' ' + ability.desc
			},
			{
				"insert": "\n"
			},
		);
	}
	return ops;
};

const getActionsDelta = (monster) => {
	const ops = [];
	if(monster.actions.length > 0){
		ops.push(
			{
				"insert": "\n"
			},
			{
				"attributes": {
					"background": "transparent",
					"color": "#111111",
					"bold": true
				},
				"insert": "Actions"
			},
			{
				"attributes": {
					"header": 2
				},
				"insert": "\n"
			},
		);
	}
	for(let action of monster.actions) {
		ops.push(
			{
				"attributes": {
					"background": "transparent",
					"color": "#111111",
					"bold": true
				},
				"insert": action.name
			},
			{
				"attributes": {
					"background": "transparent",
					"color": "#000000"
				},
				"insert": ' ' + action.desc
			},
			{
				"insert": "\n"
			},
		);
	}
	return ops;
};

const getLegendaryActionsDelta = (monster) => {
	const ops = [];
	if(monster.legendary_actions.length > 0){
		ops.push(
			{
				"insert": "\n"
			},
			{
				"attributes": {
					"background": "transparent",
					"color": "#111111",
					"bold": true
				},
				"insert": "Legendary Actions"
			},
			{
				"attributes": {
					"header": 2
				},
				"insert": "\n"
			},
		);
	}
	for(let action of monster.legendary_actions) {
		ops.push(
			{
				"attributes": {
					"background": "transparent",
					"color": "#111111",
					"bold": true
				},
				"insert": action.name
			},
			{
				"attributes": {
					"background": "transparent",
					"color": "#000000"
				},
				"insert": ' ' + action.desc
			},
			{
				"insert": "\n"
			},
		);
	}
	return ops;
};

export const monsterToDelta = (monster) => {
	let ops = [];

	let strSave = monster.strength_save || getModifier(monster.strength);
	strSave = strSave > 0 ? '+' + strSave : strSave;
	let dexSave = monster.dexterity_save || getModifier(monster.dexterity);
	dexSave = dexSave > 0 ? '+' + dexSave : dexSave;
	let conSave = monster.constitution_save || getModifier(monster.constitution);
	conSave = conSave > 0 ? '+' + conSave : conSave;
	let intSave = monster.intelligence_save || getModifier(monster.intelligence);
	intSave = intSave > 0 ? '+' + intSave : intSave;
	let wisSave = monster.wisdom_save || getModifier(monster.wisdom);
	wisSave = wisSave > 0 ? '+' + wisSave : wisSave;
	let chaSave = monster.charisma_save || getModifier(monster.charisma);
	chaSave = chaSave > 0 ? '+' + chaSave : chaSave;

	ops.push(
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"italic": true
			},
			"insert": `${monster.size} ${monster.type}, ${monster.alignment}`
		},
		{
			"insert": "\n"
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "Armor Class"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` ${monster.armor_class}`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "Hit Points"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` ${monster.hit_points} ${monster.hit_dice}`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "Speed"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": " " + Object.keys(monster.speed).map(speed => {
				return typeof monster.speed[speed] === 'boolean' ?
					`can ${speed}`
					:
					`${speed} ${monster.speed[speed]}ft`
			}).join(', ')
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "STR"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` ${monster.strength} (${getModifier(monster.strength)})`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "DEX"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` ${monster.dexterity} (${getModifier(monster.dexterity)})`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "CON"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` ${monster.constitution} (${getModifier(monster.constitution)})`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "INT"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` ${monster.intelligence} (${getModifier(monster.intelligence)})`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "WIS"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` ${monster.wisdom} (${getModifier(monster.wisdom)})`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "CHA"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` ${monster.charisma} (${getModifier(monster.charisma)})`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "Saving Throws"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": ` Str ${strSave}, Dex ${dexSave}, Con ${conSave}, Int ${intSave}, Wis ${wisSave}, Cha ${chaSave}`
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "Skills"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": " " + Object.keys(monster.skills).map(skill => `${skill} ${monster.skills[skill] > 0 ? '+' : ''}${monster.skills[skill]}`).join(', ')
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "Senses"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": " " + monster.senses
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "Languages"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": " " + monster.languages
		},
		{
			"insert": "\n"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111",
				"bold": true
			},
			"insert": "Challenge Rating"
		},
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": " " + monster.challenge_rating
		},
		{
			"insert": "\n"
		},
		...getSpecialAbilitiesDelta(monster),
		...getActionsDelta(monster),
		...getLegendaryActionsDelta(monster)
	);
	return {ops};
}