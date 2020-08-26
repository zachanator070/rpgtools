import React, {useEffect} from 'react';

import Quill from 'quill/core';
import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';
import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Header from 'quill/formats/header';
import mention from "quill-mention";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useSearchWikiPages} from "../../hooks/useSearchWikiPages";
import {LoadingView} from "../LoadingView";

Quill.debug('error');

Quill.register({
	'modules/toolbar': Toolbar,
	'themes/snow': Snow,
	'formats/bold': Bold,
	'formats/italic': Italic,
	'formats/header': Header,
	'modules/mention': mention
});

export const Editor = ({content, readOnly, onInit}) => {

	const {currentWorld, loading} = useCurrentWorld();

	let editor = null;

	if(typeof(content) === "string"){
		content = JSON.parse(content);
	}

	useEffect(() => {
		if(content && editor){
			editor.setContents(content);
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
			placeholder: readOnly ? 'This tale has yet to be told' : 'Compose an epic...',
		};
		editor = new Quill('#editor', options);
		if(onInit){
			(async () => {await onInit(editor);})();
		}
		if (content) {
			editor.setContents(content);
		}

	}, []);

	if(loading){
		return <LoadingView/>;
	}

	return <div id="editor"/>;
};
