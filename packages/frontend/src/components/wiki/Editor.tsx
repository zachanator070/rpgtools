import React, { useEffect, useRef, useState } from "react";

import Quill from "quill/core";
import Toolbar from "quill/modules/toolbar";
import Snow from "quill/themes/snow";
import Bold from "quill/formats/bold";
import Italic from "quill/formats/italic";
import Header from "quill/formats/header";
import "quill-mention";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import "quill-mention/dist/quill.mention.min.css";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { LoadingView } from "../LoadingView";
import List, { ListItem } from "quill/formats/list";

Quill.debug("error");

Quill.register({
	"modules/toolbar": Toolbar,
	"themes/snow": Snow,
	"formats/bold": Bold,
	"formats/italic": Italic,
	"formats/header": Header,
	"formats/list": List,
	"formats/list-item": ListItem,
});

interface EditorProps {
	content: string;
	readOnly: boolean;
	onInit?: (editor: Quill) => Promise<any>;
}

export const Editor = ({ content, readOnly, onInit }: EditorProps) => {
	const { currentWorld, loading } = useCurrentWorld();
	const editorCreated = useRef(false);
	const [editor, setEditor] = useState<Quill>();

	const prevContent = useRef<string>(content);

	useEffect(() => {
		if (content && editor && content !== prevContent.current) {
			editor.setContents(JSON.parse(content));
			document.querySelectorAll(".ql-picker").forEach((tool) => {
				tool.addEventListener("mousedown", function (event) {
					event.preventDefault();
					event.stopPropagation();
				});
			});
		}
	}, [content, editor]);

	const toolBar = [
		["bold", "italic", "underline", "strike"],
		["blockquote", "code-block"],

		[{ header: 1 }, { header: 2 }],
		[{ list: "ordered" }, { list: "bullet" }],
		[{ script: "sub" }, { script: "super" }],
		[{ indent: "-1" }, { indent: "+1" }],
		[{ direction: "rtl" }],

		[{ size: ["small", false, "large", "huge"] }],
		[{ header: [1, 2, 3, 4, 5, 6, false] }],

		[{ color: [] }, { background: [] }],
		[{ font: [] }],
		[{ align: [] }],

		["clean"],
		["image"],
	];

	useEffect(() => {
		if (currentWorld && !editorCreated.current) {
			const options = {
				theme: "snow",
				readOnly: readOnly,
				modules: {
					toolbar: readOnly ? false : toolBar,
					mention: {
						dataAttributes: ["id", "value", "denotationChar", "link", "target"],
						isolateCharacter: false,
						source: async (searchTerm, renderList, mentionChar) => {
							if (searchTerm === "") {
								return renderList([], searchTerm);
							}
							const allWikis = [];
							for (let folder of currentWorld.folders) {
								allWikis.push(...folder.children);
							}
							const results = allWikis.filter((wiki) =>
								wiki.name.toLowerCase().includes(searchTerm.toLowerCase())
							);
							renderList(
								results.map((result) => {
									let url = `/ui/world/${currentWorld._id}/wiki/${result._id}/view`;
									result.value = result.name;
									result.link = url;
									result.target = "_self";
									return result;
								}),
								searchTerm
							);
						},
					},
				},
				placeholder: readOnly
					? "This tale has yet to be told"
					: "Compose an epic...",
			};
			const newEditor = new Quill("#editor", options);
			if (onInit) {
				(async () => {
					await onInit(newEditor);
				})();
			}
			if (content) {
				newEditor.setContents(content);
			}
			editorCreated.current = true;
			(async () => {
				await setEditor(newEditor);
			})();
		}
	}, [currentWorld]);

	if (loading) {
		return <LoadingView />;
	}

	return (
		<div
			id="editor"
			style={{
				color: "black",
			}}
		/>
	);
};
