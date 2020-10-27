import { markdownToDelta } from "./markdown-to-delta";

export const sectionToDelta = (title, content) => {
	return { ops: markdownToDelta(content) };
};
