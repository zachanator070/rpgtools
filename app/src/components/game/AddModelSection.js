import React, {useState} from 'react';
import {SelectModel} from "../select/SelectModel";
import {Switch, Button} from "antd";
import {ModelViewer} from "../models/ModelViewer";
import {useAddModel} from "../../hooks/game/useAddModel";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import {SelectWiki} from "../select/SelectWiki";
import {MODELED_WIKI_TYPES} from "../../../../common/src/type-constants";


export const AddModelSection = () => {

	const [selectedModel, setSelectedModel] = useState();
	const {currentGame} = useCurrentGame();
	const {addModel} = useAddModel();

	const [wikiSearch, setWikiSearch] = useState(true);

	return <div className={'margin-lg'}>
		<div>
			<span className={'margin-md'}>
				Search for
			</span>

			<Switch
				checkedChildren={'Wiki\'s with Models'}
				unCheckedChildren={'Model\'s only'}
				defaultChecked
				onChange={async(checked) => {await setWikiSearch(checked)}}
			/>
		</div>
		{wikiSearch ?
			<SelectWiki
				filter={(wiki) => MODELED_WIKI_TYPES.includes(wiki.type) && wiki.model}
				onChange={async (wiki) => await setSelectedModel({model: wiki.model, wiki})}
			/>
			:
			<SelectModel
				onChange={async (model) => await setSelectedModel({model})}
				showClear={false}
			/>
		}

		<Button
			type={'primary'}
			className={'margin-lg'}
			disabled={!selectedModel}
			onClick={async () => {
				await addModel({gameId: currentGame._id, modelId: selectedModel.model._id, wikiId: selectedModel.wiki ? selectedModel.wiki._id : null});
			}}
		>
			Add Model
		</Button>
		{selectedModel &&
			<div style={{width: '100%', height: '500px'}}>
				<ModelViewer model={selectedModel.model}/>
			</div>
		}
	</div>;
};