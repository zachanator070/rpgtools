import { getSubHeading } from "./delta-helpers";

export const spellToDelta = (spell) => {
	const ops = [];

	ops.push({ insert: spell.level, attributes: { italic: true } });
	ops.push({ insert: " " });
	ops.push({ insert: spell.school, attributes: { italic: true } });
	ops.push({ insert: " | " });
	ops.push({ insert: spell.dnd_class });

	ops.push(...getSubHeading("Range"));
	ops.push({ insert: spell.range });

	ops.push(...getSubHeading("Casting Time"));
	ops.push({ insert: spell.casting_time });

	ops.push(...getSubHeading("Components"));
	ops.push({ insert: spell.components });

	if (spell.material) {
		ops.push(...getSubHeading("Material"));
		ops.push({ insert: spell.material });
	}

	ops.push(...getSubHeading("Ritual"));
	ops.push({ insert: spell.ritual });

	ops.push(...getSubHeading("Duration"));
	ops.push({ insert: spell.duration });

	ops.push(...getSubHeading("Concentration"));
	ops.push({ insert: spell.concentration });
	ops.push({ insert: "\n" });
	ops.push({ insert: "\n" });

	ops.push({ insert: spell.desc });

	if (spell.higher_level) {
		ops.push(...getSubHeading("At Higher Levels"));
		ops.push({ insert: spell.higher_level });
	}

	return ops;
};
