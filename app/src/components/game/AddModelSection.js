import React, {useState} from 'react';
import {SelectModel} from "../select/SelectModel";
import {Button} from "antd";
import {ModelViewer} from "../models/ModelViewer";
import {useAddModel} from "../../hooks/game/useAddModel";
import useCurrentGame from "../../hooks/game/useCurrentGame";


export const AddModelSection = ({renderer}) => {

	const [selectedModel, setSelectedModel] = useState();
	const {currentGame} = useCurrentGame();
	const {addModel} = useAddModel();

	return <div>
		<SelectModel
			onChange={async (model) => await setSelectedModel(model)}
			style={{marginBottom: '15px', width: 300}}
		/>
		<Button
			type={'primary'}
			className={'margin-lg'}
			onClick={async () => {
				await addModel({gameId: currentGame._id, modelId: selectedModel._id});
			}}
		>
			Add Model
		</Button>
		{selectedModel &&
			<div style={{width: '100%', height: '500px'}}>
				<ModelViewer model={selectedModel}/>
			</div>
		}
	</div>;
};