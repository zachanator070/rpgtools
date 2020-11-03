import { markdownToDelta } from "./markdown-to-delta";

export const ruleToDelta = (rule) => {
	const ops = [];
	const ruleDescription = [...markdownToDelta(rule.desc), { insert: "\n" }];
	if(ruleDescription.filter(op => op.insert.replace(/\s/g, '') !== '' ).length > 1){
		ops.push(...ruleDescription.slice(4, ruleDescription.length - 1));
	}
	for(let section of rule.subsections){
		ops.push(...markdownToDelta(section.desc));
		ops.push({ insert: "\n" });
	}
	return ops;
};