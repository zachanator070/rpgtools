import React, { useEffect, useRef, useState } from "react";

import Quill from "quill";
import "quill-mention";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill-mention/dist/quill.mention.min.css";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import LoadingView from "../LoadingView";
import useSearchWikiPages from "../../hooks/wiki/useSearchWikiPages";
import { useNavigate } from "react-router-dom";

Quill.debug("error");

interface EditorProps {
	content: string;
	readOnly?: boolean;
	onInit?: (editor: Quill) => Promise<void>;
}

interface MentionEvent extends Event {
	value: {
		link: string;
	};
}

export default function Editor({ content, readOnly, onInit }: EditorProps) {
	const { currentWorld, loading } = useCurrentWorld();
	const editorCreated = useRef(false);
	const [editor, setEditor] = useState<Quill>();
	const navigate = useNavigate();
	const { refetch } = useSearchWikiPages({
		types: null,
	});

	useEffect(() => {
		if (content && editor) {
			editor.setContents(JSON.parse(content));
			// mention links are broken. Instead, we have to use an even listener
			window.addEventListener(
				"mention-clicked",
				(event) => {
					navigate((event as MentionEvent).value.link);
				},
				false,
			);
		}
	}, [content, editor]);

	const toolBar = [
		["bold", "italic", "underline", "strike", "mention"],
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
					toolbar: readOnly ? null : toolBar,
					mention: {
						showDenotationChar: false,
						source: async (searchTerm, renderList) => {
							if (searchTerm === "") {
								return renderList([], searchTerm);
							}
							const results = await refetch({
								name: searchTerm,
							});
							renderList(
								results.docs.map((wiki) => {
									const url = `/ui/world/${currentWorld._id}/wiki/${wiki._id}/view`;
									const result: {
										value: string;
										link: string;
										target: string;
									} = {
										value: wiki.name,
										link: url,
										target: "_self",
									};
									return result;
								}),
								searchTerm,
							);
						},
						render: (item) => {
							return `<a href='${item.link}'/>`;
						},
					},
				},
				placeholder: readOnly ? "This tale has yet to be told" : "Compose an epic...",
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
}
