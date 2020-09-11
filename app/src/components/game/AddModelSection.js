import React, {useState} from 'react';
import {SelectModel} from "../select/SelectModel";
import {Button} from "antd";
import {ModelViewer} from "../models/ModelViewer";


export const AddModelSection = ({renderer}) => {

	const [selectedModel, setSelectedModel] = useState();
	return <>
		<SelectModel
			onChange={async (model) => await setSelectedModel(model)}
			style={{marginBottom: '15px'}}
		/>
		<Button
			type={'primary'}
			onClick={async () => {
				renderer.addModel(`/models/${selectedModel.fileId}`);
			}}
		>
			Add Model
		</Button>
		{selectedModel &&
			<div style={{width: '100%', height: '500px'}}>
				<ModelViewer model={selectedModel}/>
			</div>
		}
		</>;
};