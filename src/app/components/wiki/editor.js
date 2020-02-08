import React, {Component, useEffect} from 'react';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useSearchWikiPages} from "../../hooks/useSearchWikiPages";

export const Editor = ({content, readOnly}) => {

	const {currentWorld} = useCurrentWorld();

	const {searchWikiPages} = useSearchWikiPages();

	return <ReactQuill
		value={content}
		theme={'snow'}
		readOnly={readOnly}
		modules={{
			toolbar:
				readOnly ? false : [
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
		}}
		placeholder={'Compose an epic...'}
	/>;
};
