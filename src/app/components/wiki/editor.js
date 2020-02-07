import React, {Component, useEffect} from 'react';

import Quill from 'quill/core';
import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';
import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Header from 'quill/formats/header';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useSearchWikiPages} from "../../hooks/useSearchWikiPages";

Quill.register({
	'modules/toolbar': Toolbar,
	'themes/snow': Snow,
	'formats/bold': Bold,
	'formats/italic': Italic,
	'formats/header': Header
});

export const Editor = ({content, readOnly}) => {

	const {currentWorld} = useCurrentWorld();

	let editor = null;

	useEffect(() => {
		if(content && editor.content){
			editor.content.setContents(this.props.content);
		}
	});

	const {searchWikiPages} = useSearchWikiPages();

	useEffect(() => {
		const options = {
			theme: 'snow',
			readOnly: readOnly,
			modules: {
				toolbar: readOnly ? false : [
					[{header: [1, 2, false]}],
					['bold', 'italic', 'underline'],
					['image', 'code-block']
				],
				mention: {
					dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target'],
					isolateCharacter: false,
					source: (searchTerm, renderList, mentionChar) => {
						if (searchTerm === "") {
							return renderList([], searchTerm);
						}
						searchWikiPages(searchTerm, currentWorld._id).then( (results) => {
							let pages = results.searchWikiPages;
							renderList(pages.map((result) => {
								let url = `/ui/world/${currentWorld._id}/wiki/${result._id}/view`;
								result.value = result.name;
								result.link = url;
								result.target = "_self";
								return result;
							}), searchTerm);
						});
					},
				}
			},
			placeholder: 'Compose an epic...',
		};
		editor = new Quill('#editor', options);
		if (content) {
			editor.setContents(content);
		}

	}, []);

	return <div id="editor"/>;
}

export default Editor;