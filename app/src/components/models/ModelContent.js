import React, {useEffect, useRef, useState} from 'react';
import {Button} from "antd";
import {EditOutlined, DownloadOutlined} from '@ant-design/icons';
import {useHistory} from 'react-router-dom';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {LoadingView} from "../LoadingView";
import {ModelViewer} from "./ModelViewer";


export const ModelContent = ({model}) => {
	const history = useHistory();
	const {currentWorld, loading} = useCurrentWorld();

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
			<ModelViewer model={model}/>
		</div>
		<div className={'margin-lg'}>
			<Button type={'primary'} onClick={() => history.push(`/ui/world/${currentWorld._id}/model/${model._id}/edit`)}>Edit<EditOutlined /></Button>
		</div>
	</>;
};
