import {markdownToDelta} from "./markdown-to-delta";


const getHeading = (title) => {
	return [
		{insert: "\n"},
		{insert: "\n"},
		{insert: title, attributes: {size: 'large'}},
	];
}

const getSubHeading = (title, newLine) => {
	const ops = [
		{insert: "\n"},
		{insert: "\n"},
		{insert: title + ': ', attributes: {bold: true, italic: true}},
	];
	if(newLine){
		ops.push(
			{insert: "\n"},
			{insert: "\n"},
		)
	}
	return ops;
}

export const classToDelta = (characterClass) => {
	const ops = [];

	ops.push(...markdownToDelta(characterClass.desc));

	ops.push(...getHeading('Hit Points'));
	ops.push(...getSubHeading('Hit Dice'));
	ops.push({insert: characterClass.hit_dice});
	ops.push(...getSubHeading('HP at First Level'));
	ops.push({insert: characterClass.hp_at_1st_level});
	ops.push(...getSubHeading('HP at Higher Levels'));
	ops.push({insert: characterClass.hp_at_higher_levels});

	ops.push(...getHeading('Proficiencies'));
	ops.push(...getSubHeading('Armor'));
	ops.push({insert: characterClass.prof_armor});
	ops.push(...getSubHeading('Weapons'));
	ops.push({insert: characterClass.prof_weapons});
	ops.push(...getSubHeading('Tools'));
	ops.push({insert: characterClass.prof_tools});
	ops.push(...getSubHeading('Saving Throws'));
	ops.push({insert: characterClass.prof_saving_throws});
	ops.push(...getSubHeading('Skills'));
	ops.push({insert: characterClass.prof_skills});

	ops.push(...getHeading('Equipment', true));
	ops.push(...markdownToDelta(characterClass.equipment));

	ops.push(...getHeading('The ' + characterClass.name, true));
	ops.push(...markdownToDelta(characterClass.table));

	if(characterClass.subtypes_name){
		ops.push(...getHeading(characterClass.subtypes_name));
	}
	for(let subtype of characterClass.archetypes){
		ops.push(...getSubHeading(subtype.name, true));
		ops.push(...markdownToDelta(subtype.desc));
	}

	return ops;
};