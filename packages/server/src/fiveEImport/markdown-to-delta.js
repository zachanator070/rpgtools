// Modified version of markdown-to-quill-delta package, default one was giving me trouble

import unified from "unified";
import markdown from "remark-parse";
import AsciiTable from "ascii-table";

export const markdownToDelta = (md) => {
	const fixGhettoTable = (text) => {
		let fixedText = "";
		let lastLineWasTable = false;
		let lastLine = null;
		for (let line of text.split("\n")) {
			if (line.includes("|")) {
				if (!lastLineWasTable && lastLine !== "") {
					line = "\n" + line;
				}
				lastLineWasTable = true;
			} else {
				lastLineWasTable = false;
			}
			lastLine = line;
			fixedText += line + "\n";
		}
		return fixedText;
	};

	md = fixGhettoTable(md);

	const processor = unified().use(markdown);
	const tree = processor.parse(md);
	const ops = [];

	const visitChildren = (
		node,
		nextNode = {},
		inheritedAttributes = {},
		inheritedProperties = {}
	) => {
		const ops = [];
		for (let childIndex = 0; childIndex < node.children.length; childIndex++) {
			const child = node.children[childIndex];
			let next = nextNode;
			if (childIndex <= node.children.length - 2) {
				next = node.children[childIndex + 1];
			}
			ops.push(
				...visitNode(child, next, inheritedAttributes, inheritedProperties)
			);
		}
		return ops;
	};

	const SPACED_ELEMENTS = ["paragraph", "table"];

	const visitNode = (
		node,
		nextNode = {},
		inheritedAttributes = {},
		inheritedProperties = {}
	) => {
		switch (node.type) {
			case "paragraph":
				const paragraphOps = [
					...visitChildren(
						node,
						nextNode,
						inheritedAttributes,
						inheritedProperties
					),
					{ insert: "\n" },
				];
				if (SPACED_ELEMENTS.includes(nextNode.type)) {
					paragraphOps.push({ insert: "\n" });
				}
				return paragraphOps;
			case "text":
				return [
					{
						insert: node.value,
						attributes: inheritedAttributes,
						...inheritedProperties,
					},
				];
			case "strong":
				return visitChildren(
					node,
					nextNode,
					Object.assign({}, inheritedAttributes, { bold: true }),
					inheritedProperties
				);
			case "emphasis":
				return visitChildren(
					node,
					nextNode,
					Object.assign({}, inheritedAttributes, { italic: true }),
					inheritedProperties
				);
			case "delete":
				return visitChildren(
					node,
					nextNode,
					Object.assign({}, inheritedAttributes, { strike: true }),
					inheritedProperties
				);
			case "image":
				const imageOp = { insert: { image: node.url } };
				if (node.alt) {
					imageOp.attributes = { alt: node.alt };
				}
				return [imageOp];
			case "link":
				return visitChildren(node, nextNode, inheritedAttributes, {
					link: node.url,
				});
			case "inlineCode":
				return [
					{
						insert: node.value,
						attributes: Object.assign({}, inheritedAttributes, {
							font: "monospace",
						}),
					},
				];
			case "heading":
				const getHeadingSize = (depth) => {
					switch (depth) {
						case 1:
							return "huge";
						default:
							return "large";
					}
				};
				return [
					{ insert: "\n" },
					...visitChildren(
						node,
						nextNode,
						Object.assign({}, inheritedAttributes, {
							size: getHeadingSize(node.depth),
						}),
						inheritedProperties
					),
					{ insert: "\n" },
					{ insert: "\n" },
				];
			case "list":
				const listOps = [];
				let listAttribute = "";
				// have to do this calculation here because ordered attribute is on list node, not listItem node
				for (let child of node.children) {
					let listChildren = visitChildren(
						child,
						{},
						inheritedAttributes,
						inheritedProperties
					).filter((op) => op.insert !== "\n");

					listOps.push(...listChildren);

					if (node.ordered) {
						listAttribute = "ordered";
					} else if (child.checked) {
						listAttribute = "checked";
					} else if (child.checked === false) {
						listAttribute = "unchecked";
					} else {
						listAttribute = "bullet";
					}
					listOps.push({ insert: "\n", attributes: { list: listAttribute } });
				}
				return listOps;
			case "listItem":
				const itemChildrenOps = visitChildren(
					node,
					nextNode,
					inheritedAttributes,
					inheritedProperties
				);
				if (
					itemChildrenOps.length > 0 &&
					itemChildrenOps[itemChildrenOps.length - 1].insert === "\n"
				) {
					itemChildrenOps.pop();
				}
				return itemChildrenOps;
			case "code":
				return [
					{ insert: node.value },
					{ insert: "\n", attributes: { "code-block": true } },
					{ insert: "\n" },
				];
			case "blockquote":
				const blockQuoteChildren = visitChildren(
					node,
					{},
					inheritedAttributes,
					inheritedProperties
				);
				blockQuoteChildren.pop();
				blockQuoteChildren.push({
					attributes: { blockquote: true },
					insert: "\n",
				});
				return [
					{ insert: "\n" },
					{ insert: "\n" },
					...blockQuoteChildren,
					{ insert: "\n" },
				];
			case "table":
				const table = new AsciiTable();
				table.removeBorder();
				for (let child of node.children) {
					const cells = child.children.map((cell) =>
						visitChildren(cell, {}, inheritedAttributes, inheritedProperties)
							.map((childOp) => childOp.insert)
							.join()
					);
					table.addRow(...cells);
				}

				const tableOp = {
					attributes: Object.assign({}, inheritedAttributes, {
						font: "monospace",
					}),
					insert: table.toString(),
				};
				if (table.toString().split("\n")[0].length > 140) {
					tableOp.attributes.size = "small";
				}

				const tableOps = [tableOp, { insert: "\n" }];
				if (SPACED_ELEMENTS.includes(nextNode.type)) {
					tableOps.push({ insert: "\n" });
				}
				return tableOps;
			default:
				throw new Error(`Unsupported note type: ${node.type}`);
		}
	};

	for (let index = 0; index < tree.children.length; index++) {
		const child = tree.children[index];
		let nextNode = {};
		if (index <= tree.children.length - 2) {
			nextNode = tree.children[index + 1];
		}
		ops.push(...visitNode(child, nextNode));
	}
	return ops;
};
