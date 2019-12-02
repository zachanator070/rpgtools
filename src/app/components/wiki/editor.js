import React, {Component} from 'react';

import Quill from 'quill/core';
import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';
import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Header from 'quill/formats/header';

Quill.register({
	'modules/toolbar': Toolbar,
	'themes/snow': Snow,
	'formats/bold': Bold,
	'formats/italic': Italic,
	'formats/header': Header
});

class Editor extends Component {

	componentDidUpdate() {
		if (this.props.content) {
			this.editor.setContents(this.props.content);
		}
	}

	componentDidMount() {

		const options = {
			theme: 'snow',
			readOnly: this.props.readOnly,
			modules: {
				toolbar: this.props.readOnly ? false : [
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
						this.props.searchWikis({name: searchTerm, world: this.props.currentWorld._id}, (results) => {
							renderList(results.map((result) => {
								let url = `/ui/wiki/view?wiki=${result._id}&world=${this.props.currentWorld._id}`;
								if (this.props.currentMap && this.props.currentMap.image) {
									url += `&map=${this.props.currentMap.image._id}`;
								}
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
		this.editor = new Quill('#editor', options);
		if (this.props.content) {
			this.editor.setContents(this.props.content);
		}
	}

	render() {
		return <div id="editor"></div>;
	}
}

export default Editor;