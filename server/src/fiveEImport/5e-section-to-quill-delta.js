import {markdownToDelta} from "./markdown-to-delta";

export const sectionToDelta = (title, content) => {

	const ops = [];
	ops.push(
		{
			"attributes": {
				"background": "transparent",
				"color": "#111111"
			},
			"insert": markdownToDelta(content)
		},
	);

	return ops;

}