import React, {useEffect, useRef, useState} from 'react';
import {Button} from "antd";
import {EditOutlined, DownloadOutlined} from '@ant-design/icons';
import {useHistory} from 'react-router-dom';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {LoadingView} from "../LoadingView";
import {ModelRenderer} from "./ModelRenderer";


export const ModelContent = ({model}) => {
	const history = useHistory();
	const {currentWorld, loading} = useCurrentWorld();
	const [renderer, setRenderer] = useState();

	const renderCanvas = useRef();

	useEffect(() => {
		(async () => {
			await setRenderer(
				new ModelRenderer(
					renderCanvas.current,
					model.depth,
					model.width,
					model.height,
					() => {}
					)
			);
		})();
	}, []);

	useEffect(() => {
		if(renderer && model){
			renderer.modelDepth = model.depth;
			renderer.modelWidth = model.width;
			renderer.modelHeight = model.height;
			renderer.setModel(`/models/${model.fileId}`);
		}
	}, [renderer, model]);

	if(loading){
		return <LoadingView/>;
	}

	return <>
		<div className={'margin-lg'}>
			<h1>{model.name}</h1>
		</div>
		<div className={'margin-lg'}>
			Depth: {model.depth}
		</div>
		<div className={'margin-lg'}>
			Width: {model.width}
		</div>
		<div className={'margin-lg'}>
			Height: {model.height}
		</div>
		<div className={'margin-lg'}>
			Filename: {model.fileName}
		</div>
		<div className={'margin-lg'}>
			<a href={`/models/${model.fileId}`}>Download Model <DownloadOutlined /></a>
		</div>
		<div style={{width: 500, height: 750}}>
			<canvas ref={renderCanvas} style={{width: '100%', height: '100%'}}/>
		</div>
		<div className={'margin-lg'}>
			<Button type={'primary'} onClick={() => history.push(`/ui/world/${currentWorld._id}/model/${model._id}/edit`)}>Edit<EditOutlined /></Button>
		</div>
	</>;
};
