import { markdownToDelta } from "./markdown-to-delta";
import {inject, injectable} from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {UnitOfWork} from "../types";
import {
	Open5eApiClient,
	Open5eClass,
	Open5eMonster,
	Open5eRace,
	Open5eSection,
	Open5eSpell,
} from "./open-5e-api-client";
import {Dnd5eRule} from "./dnd-5e-api-client";

@injectable()
export class DeltaFactory {
	@inject(INJECTABLE_TYPES.Open5eApiClient)
	apiClient: Open5eApiClient;

	fromCharacterClass = async (characterClass: Open5eClass, worldId: string, unitOfWork: UnitOfWork) => {
		const ops = [];

		ops.push(...this.getHeading("Hit Points"));
		ops.push(...this.getSubHeading("Hit Dice"));
		ops.push({ insert: characterClass.hit_dice });
		ops.push(...this.getSubHeading("HP at First Level"));
		ops.push({ insert: characterClass.hp_at_1st_level });
		ops.push(...this.getSubHeading("HP at Higher Levels"));
		ops.push({ insert: characterClass.hp_at_higher_levels });

		ops.push(...this.getHeading("Proficiencies"));
		ops.push(...this.getSubHeading("Armor"));
		ops.push({ insert: characterClass.prof_armor });
		ops.push(...this.getSubHeading("Weapons"));
		ops.push({ insert: characterClass.prof_weapons });
		ops.push(...this.getSubHeading("Tools"));
		ops.push({ insert: characterClass.prof_tools });
		ops.push(...this.getSubHeading("Saving Throws"));
		ops.push({ insert: characterClass.prof_saving_throws });
		ops.push(...this.getSubHeading("Skills"));
		ops.push({ insert: characterClass.prof_skills });

		ops.push(...this.getHeading("Equipment", true));
		ops.push(...markdownToDelta(characterClass.equipment));

		if (characterClass.subtypes_name) {
			ops.push(...this.getHeading(characterClass.subtypes_name));
		}
		for (let subtype of characterClass.archetypes) {
			ops.push(...this.getSubHeading(subtype.name, true));
			ops.push(...markdownToDelta(subtype.desc));
		}

		ops.push(...this.getHeading("The " + characterClass.name, true));
		ops.push(...markdownToDelta(characterClass.table));

		ops.push(...markdownToDelta(characterClass.desc));

		const classSpells: { [key: string]: Open5eSpell[] } = {};
		for await (let spell of this.apiClient.searchSpells(characterClass.name)) {
			if (!classSpells[spell.level]) {
				classSpells[spell.level] = [spell];
			} else {
				classSpells[spell.level].push(spell);
			}
		}

		if (Object.keys(classSpells).length > 0) {
			ops.push(...this.getHeading("Class Spells"));

			const levels = Object.keys(classSpells).sort();
			if (levels[levels.length - 1] === "Cantrip") {
				levels.unshift(levels.pop());
			}

			for (let level of levels) {
				ops.push({ insert: "\n" });
				ops.push({ insert: "\n" });
				ops.push({ insert: level, attributes: { bold: true } });
				ops.push({ insert: "\n", attributes: { header: 2 } });
				ops.push({ insert: "\n" });
				for (let spell of classSpells[level]) {
					const article = await unitOfWork.articleRepository.findOneByNameAndWorld(spell.name, worldId);
					if (!article) {
						console.warn(`Could not find spell for ${spell.name}`);
					}
					ops.push(
						{
							insert: {
								mention: {
									index: "-1",
									denotationChar: "@",
									value: `<a href=\"/ui/world/${article.world}/wiki/${article._id}/view\" target=_self>${spell.name}`,
									link: `/ui/world/${article.world}/wiki/${article._id}/view`,
									target: "_self",
								},
							},
						},
						{ insert: "\n" }
					);
				}
			}
		}

		return ops;
	};

	fromSpell = (spell: Open5eSpell) => {
		const ops = [];

		ops.push({ insert: spell.level, attributes: { italic: true } });
		ops.push({ insert: " " });
		ops.push({ insert: spell.school, attributes: { italic: true } });
		ops.push({ insert: " | " });
		ops.push({ insert: spell.dnd_class });

		ops.push(...this.getSubHeading("Range"));
		ops.push({ insert: spell.range });

		ops.push(...this.getSubHeading("Casting Time"));
		ops.push({ insert: spell.casting_time });

		ops.push(...this.getSubHeading("Components"));
		ops.push({ insert: spell.components });

		if (spell.material) {
			ops.push(...this.getSubHeading("Material"));
			ops.push({ insert: spell.material });
		}

		ops.push(...this.getSubHeading("Ritual"));
		ops.push({ insert: spell.ritual });

		ops.push(...this.getSubHeading("Duration"));
		ops.push({ insert: spell.duration });

		ops.push(...this.getSubHeading("Concentration"));
		ops.push({ insert: spell.concentration });
		ops.push({ insert: "\n" });
		ops.push({ insert: "\n" });

		ops.push({ insert: spell.desc });

		if (spell.higher_level) {
			ops.push(...this.getSubHeading("At Higher Levels"));
			ops.push({ insert: spell.higher_level });
		}

		return ops;
	};

	fromRace = (race: Open5eRace) => {
		const ops = [];
		ops.push(...markdownToDelta(race.desc));
		ops.push({ insert: "\n" });
		ops.push(...markdownToDelta(race.asi_desc));
		ops.push({ insert: "\n" });
		ops.push(...markdownToDelta(race.age));
		ops.push({ insert: "\n" });
		ops.push(...markdownToDelta(race.alignment));
		ops.push({ insert: "\n" });
		ops.push(...markdownToDelta(race.size));
		ops.push({ insert: "\n" });
		ops.push(...markdownToDelta(race.speed_desc));
		ops.push({ insert: "\n" });
		ops.push(...markdownToDelta(race.languages));
		ops.push({ insert: "\n" });
		if (race.vision) {
			ops.push(...markdownToDelta(race.vision));
			ops.push({ insert: "\n" });
		}
		if (race.traits) {
			ops.push(...markdownToDelta(race.traits));
			ops.push({ insert: "\n" });
		}
		if (race.subraces.length > 0) {
			ops.push(
				{ insert: "\n" },
				{ insert: "Subraces", attributes: { size: "large" } },
				{ insert: "\n" }
			);
		}
		for (let subrace of race.subraces) {
			ops.push(
				{ insert: "\n" },
				{ insert: subrace.name, attributes: { size: "large" } },
				{ insert: "\n" },
				{ insert: "\n" }
			);
			ops.push(...markdownToDelta(subrace.desc));
			ops.push({ insert: "\n" });
			ops.push(...markdownToDelta(subrace.asi_desc));
			ops.push({ insert: "\n" });
			ops.push(...markdownToDelta(subrace.traits));
		}

		return ops;
	};

	fromRule = (rule: Dnd5eRule) => {
		const ops = [];
		const ruleDescription = [...markdownToDelta(rule.desc), { insert: "\n" }];
		for (let subsection of rule.subsections) {
			ruleDescription.push(...markdownToDelta(subsection.desc), { insert: "\n" });
		}
		if (ruleDescription.filter((op) => op.insert.replace(/\s/g, "") !== "").length > 1) {
			ops.push(...ruleDescription.slice(4, ruleDescription.length - 1));
		}
		for (let section of rule.subsections) {
			ops.push(...markdownToDelta(section.desc));
			ops.push({ insert: "\n" });
		}
		return ops;
	};

	fromSection = (section: Open5eSection) => {
		return { ops: markdownToDelta(section.desc) };
	};

	fromMonster = (monster: Open5eMonster) => {
		let ops = [];

		let strSave: string | number = monster.strength_save || this.getModifier(monster.strength);
		strSave = strSave > 0 ? "+" + strSave : strSave;
		let dexSave: string | number = monster.dexterity_save || this.getModifier(monster.dexterity);
		dexSave = dexSave > 0 ? "+" + dexSave : dexSave;
		let conSave: string | number =
			monster.constitution_save || this.getModifier(monster.constitution);
		conSave = conSave > 0 ? "+" + conSave : conSave;
		let intSave: string | number =
			monster.intelligence_save || this.getModifier(monster.intelligence);
		intSave = intSave > 0 ? "+" + intSave : intSave;
		let wisSave: string | number = monster.wisdom_save || this.getModifier(monster.wisdom);
		wisSave = wisSave > 0 ? "+" + wisSave : wisSave;
		let chaSave: string | number = monster.charisma_save || this.getModifier(monster.charisma);
		chaSave = chaSave > 0 ? "+" + chaSave : chaSave;

		ops.push(
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					italic: true,
				},
				insert: `${monster.size} ${monster.type}, ${monster.alignment}`,
			},
			{
				insert: "\n",
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "Armor Class",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` ${monster.armor_class}`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "Hit Points",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` ${monster.hit_points} ${monster.hit_dice}`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "Speed",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert:
					" " +
					Object.keys(monster.speed)
						.map((speed) => {
							return typeof monster.speed[speed] === "boolean"
								? `can ${speed}`
								: `${speed} ${monster.speed[speed]}ft`;
						})
						.join(", "),
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "STR",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` ${monster.strength} (${this.getModifier(monster.strength)})`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "DEX",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` ${monster.dexterity} (${this.getModifier(monster.dexterity)})`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "CON",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` ${monster.constitution} (${this.getModifier(monster.constitution)})`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "INT",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` ${monster.intelligence} (${this.getModifier(monster.intelligence)})`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "WIS",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` ${monster.wisdom} (${this.getModifier(monster.wisdom)})`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "CHA",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` ${monster.charisma} (${this.getModifier(monster.charisma)})`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "Saving Throws",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: ` Str ${strSave}, Dex ${dexSave}, Con ${conSave}, Int ${intSave}, Wis ${wisSave}, Cha ${chaSave}`,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "Skills",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert:
					" " +
					Object.keys(monster.skills)
						.map(
							(skill) => `${skill} ${monster.skills[skill] > 0 ? "+" : ""}${monster.skills[skill]}`
						)
						.join(", "),
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "Senses",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: " " + monster.senses,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "Languages",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: " " + monster.languages,
			},
			{
				insert: "\n",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
					bold: true,
				},
				insert: "Challenge Rating",
			},
			{
				attributes: {
					background: "transparent",
					color: "#111111",
				},
				insert: " " + monster.challenge_rating,
			},
			{
				insert: "\n",
			},
			...this.getSpecialAbilitiesDelta(monster),
			...this.getActionsDelta(monster),
			...this.getLegendaryActionsDelta(monster)
		);
		return { ops };
	};

	private getLegendaryActionsDelta = (monster: Open5eMonster) => {
		const ops = [];
		if (monster.legendary_actions.length > 0) {
			ops.push(
				{
					insert: "\n",
				},
				{
					attributes: {
						background: "transparent",
						color: "#111111",
						bold: true,
					},
					insert: "Legendary Actions",
				},
				{
					attributes: {
						header: 2,
					},
					insert: "\n",
				}
			);
		}
		for (let action of monster.legendary_actions) {
			ops.push(
				{
					attributes: {
						background: "transparent",
						color: "#111111",
						bold: true,
					},
					insert: action.name,
				},
				{
					attributes: {
						background: "transparent",
						color: "#000000",
					},
					insert: " " + action.desc,
				},
				{
					insert: "\n",
				}
			);
		}
		return ops;
	};

	private getModifier = (score: number) => {
		return Math.floor((score - 10) / 2);
	};

	private getSpecialAbilitiesDelta = (monster: Open5eMonster) => {
		const ops = [];
		if (monster.special_abilities.length > 0) {
			ops.push(
				{
					insert: "\n",
				},
				{
					attributes: {
						background: "transparent",
						color: "#111111",
						bold: true,
					},
					insert: "Special Abilities",
				},
				{
					attributes: {
						header: 2,
					},
					insert: "\n",
				}
			);
		}
		for (let ability of monster.special_abilities) {
			ops.push(
				{
					attributes: {
						background: "transparent",
						color: "#111111",
						bold: true,
					},
					insert: ability.name,
				},
				{
					attributes: {
						background: "transparent",
						color: "#000000",
					},
					insert: " " + ability.desc,
				},
				{
					insert: "\n",
				}
			);
		}
		return ops;
	};

	private getActionsDelta = (monster: Open5eMonster) => {
		const ops = [];
		if (monster.actions.length > 0) {
			ops.push(
				{
					insert: "\n",
				},
				{
					attributes: {
						background: "transparent",
						color: "#111111",
						bold: true,
					},
					insert: "Actions",
				},
				{
					attributes: {
						header: 2,
					},
					insert: "\n",
				}
			);
		}
		for (let action of monster.actions) {
			ops.push(
				{
					attributes: {
						background: "transparent",
						color: "#111111",
						bold: true,
					},
					insert: action.name,
				},
				{
					attributes: {
						background: "transparent",
						color: "#000000",
					},
					insert: " " + action.desc,
				},
				{
					insert: "\n",
				}
			);
		}
		return ops;
	};

	private getHeading = (title: string, newLine = false) => {
		const ops = [
			{ insert: "\n" },
			{ insert: "\n" },
			{ insert: title, attributes: { size: "large" } },
		];
		if (newLine) {
			ops.push({ insert: "\n" }, { insert: "\n" });
		}
		return ops;
	};

	private getSubHeading = (title: string, newLine = false) => {
		const ops = [
			{ insert: "\n" },
			{ insert: "\n" },
			{ insert: title + ": ", attributes: { bold: true, italic: true } },
		];
		if (newLine) {
			ops.push({ insert: "\n" }, { insert: "\n" });
		}
		return ops;
	};
}
