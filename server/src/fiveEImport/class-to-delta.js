import {markdownToDelta} from "./markdown-to-delta";
import {getHeading, getSubHeading} from "./delta-helpers";
import {searchSpells} from "./open-5e-api-client";
import {Article} from "../models/article";


export const classToDelta = async (characterClass) => {
	const ops = [];

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

	if(characterClass.subtypes_name){
		ops.push(...getHeading(characterClass.subtypes_name));
	}
	for(let subtype of characterClass.archetypes){
		ops.push(...getSubHeading(subtype.name, true));
		ops.push(...markdownToDelta(subtype.desc));
	}

	ops.push(...getHeading('The ' + characterClass.name, true));
	ops.push(...markdownToDelta(characterClass.table));

	ops.push(...markdownToDelta(characterClass.desc));

	const classSpells = {};
	for await(let spell of searchSpells(characterClass.name)){
		if(!classSpells[spell.level]){
			classSpells[spell.level] = [spell];
		}
		else{
			classSpells[spell.level].push(spell);
		}
	}

	if(Object.keys(classSpells).length > 0){
		ops.push(...getHeading('Class Spells'))

		const levels = Object.keys(classSpells).sort();
		if(levels[levels.length - 1] === 'Cantrip'){
			levels.unshift(levels.pop());
		}

		for(let level of levels){
			ops.push({insert: "\n"});
			ops.push({insert: "\n"});
			ops.push({insert: level, attributes: {bold: true}});
			ops.push({insert: "\n", attributes: {header: 2}});
			ops.push({insert: "\n"});
			for(let spell of classSpells[level]){
				const article = await Article.findOne({name: spell.name});
				ops.push(
					{
						insert: {
							mention: {
								index: "-1",
								denotationChar: "@",
								value: `<a href=\"/ui/world/${article.world}/wiki/${article._id}/view\" target=_self>${spell.name}`,
								link: `/ui/world/${article.world}/wiki/${article._id}/view`,
								target: "_self"
							}
						}
					},
					{insert: "\n"}
				);
			}
		}
	}

	return ops;
};