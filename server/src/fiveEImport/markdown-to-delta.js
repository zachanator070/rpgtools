// Modified version of markdown-to-quill-delta package, default one was giving me trouble

import visit from "unist-util-visit";
import unified from "unified";
import markdown from "remark-parse";

export const markdownToDelta = (md) => {
	const processor = unified().use(markdown);
	const tree = processor.parse(md);
	const ops = [];
	const addNewline = () => ops.push({ insert: "\n" });
	const flatten = (arr) => arr.reduce((flat, next) => flat.concat(next), []);
	const listVisitor = (node) => {
		if (node.ordered && node.start !== 1) {
			throw Error("Quill-Delta numbered lists must start from 1.");
		}
		visit(node, "listItem", listItemVisitor(node));
	};
	const listItemVisitor = (listNode) => (node) => {
		for (const child of node.children) {
			visit(child, "paragraph", paragraphVisitor());
			let listAttribute = "";
			if (listNode.ordered) {
				listAttribute = "ordered";
			}
			else if (node.checked) {
				listAttribute = "checked";
			}
			else if (node.checked === false) {
				listAttribute = "unchecked";
			}
			else {
				listAttribute = "bullet";
			}
			ops.push({ insert: "\n", attributes: { list: listAttribute } });
		}
	};

	const visitChildren = (node, inheritedAttributes) => {
		const ops = [];
		for(let child of node.children) {
			ops.push(...visitNode(child, inheritedAttributes));
		}
		return ops;
	}

	const visitNode = (node, inheritedAttributes, inheritedProperties) => {
		switch(node.type){
			case "text":
				return [{
					insert: node.value,
					attributes: inheritedAttributes,
					...inheritedProperties
				}]
			case "strong":
				return visitChildren(node, Object.assign({}, inheritedAttributes, {bold: true}));
			case "emphasis":
				return visitChildren(node, Object.assign({}, inheritedAttributes, {italic: true}));
			case "delete":
				return visitChildren(node, Object.assign({}, inheritedAttributes, {strike: true}));
			case "image":
				const imageOp = { insert: { image: node.url } };
				if(node.alt){
					imageOp.attributes = { alt: node.alt };
				}
				return [imageOp];
			case "link":
				return visitChildren(node, inheritedAttributes, {link: node.url});
			case "inlineCode":
				return [{
					insert: node.value,
					attributes: Object.assign({}, inheritedAttributes, {font: "monospace"})
				}];
			case "heading":
				const getHeadingSize = (depth) => {
					switch (depth) {
						case 1:
							return "huge";
						default:
							return "large";
					}
				};
				return visitChildren(node, Object.assign({}, inheritedAttributes, { size: getHeadingSize(node.depth) }));
			case "list":
				const listChildren = visitChildren(node, inheritedAttributes);
				const listOps = [];
				let listAttribute = "";

				for(let child of listChildren){
					listOps.push(child);
					if (node.ordered) {
						listAttribute = "ordered";
					}
					else if (child.checked) {
						listAttribute = "checked";
					}
					else if (child.checked === false) {
						listAttribute = "unchecked";
					}
					else {
						listAttribute = "bullet";
					}
					listOps.push({ insert: "\n", attributes: { list: listAttribute } });
				}
				return listOps;
			case "code":
				return [
					{ insert: node.value },
					{ insert: "\n", attributes: { "code-block": true } }
				];
			case "blockquote":
				const blockQuoteChildren = visitChildren(node, inheritedAttributes);
				return [
					...blockQuoteChildren,
					{blockquote: true},
					{insert: "\n"}
				];
			case "table":
				const cols = [];
				for(let index = 0; index < node.children.length; index ++){
					const child = node.children[index];
					if(cols.lend)
				}
			default:
				throw new Error(`Unsupported note type: ${node.type}`);
		}

	};

	const tableVisitor = (node) => {
		const columns = [];
		for(let child of node.children){

		}
	};
	const blockQuoteVisitor = (node) => {
		ops.push({blockquote: visitChildren(node)});
	};
	for (let child of tree.children) {
		if (child.type === "paragraph") {
			paragraphVisitor()(child);
			if (nextType === "paragraph" ||
				nextType === "code" ||
				nextType === "heading") {
				addNewline();
				addNewline();
			}
			else if (nextType === "lastOne" || nextType === "list") {
				addNewline();
			}
		}
		else if (child.type === "list") {
			listVisitor(child);
			if (nextType === "list") {
				addNewline();
			}
		}
		else if (child.type === "code") {
			ops.push({ insert: child.value });
			ops.push({ insert: "\n", attributes: { "code-block": true } });
			if (nextType === "paragraph" || nextType === "lastOne") {
				addNewline();
			}
		}
		else if (child.type === "heading") {
			headingVisitor(child);
			addNewline();
		}
		else if (child.type === "table") {
			tableVisitor(child);
			addNewline();
		}
		else if (child.type === 'blockquote'){
			blockQuoteVisitor(child);
		}
		else {
			throw new Error(`Unsupported child type: ${child.type}`);
		}
	}
	return ops;
}
