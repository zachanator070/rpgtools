import React from 'react';
import {Row, Col, Table, Button} from "antd";
import {EditOutlined, DownloadOutlined} from '@ant-design/icons';
import {useHistory} from 'react-router-dom';
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {LoadingView} from "../LoadingView";
import {ModelViewer} from "./ModelViewer";


export const ModelContent = ({model}) => {
	const history = useHistory();
	const {currentWorld, loading} = useCurrentWorld();

	if(loading){
		return <LoadingView/>;
	}

	const statsColumns = [
		{
			title: 'Dimension',
			dataIndex: 'dimension',
			key: 'dimension',
		},
		{
			title: 'Value',
			dataIndex: 'value',
			key: 'value',
		},
	];

	const statsData = [
		{
			key: '1',
			dimension: 'Depth',
			value: model.depth
		},
		{
			key: '2',
			dimension: 'Width',
			value: model.width
		},
		{
			key: '3',
			dimension: 'Height',
			value: model.height
		}
	]

	return <>
		<div className={'margin-lg'}>
			<h1>{model.name}</h1>
		</div>
		<Row>
			<Col span={12}>
				<div className={'margin-lg'}>
					Filename: {model.fileName}
					<a className={'margin-lg-left'} href={`/models/${model.fileId}`}>Download Model <DownloadOutlined /></a>
				</div>
				<div style={{width: '500px'}}>
					<Table size={'small'} dataSource={statsData} columns={statsColumns} pagination={false} showHeader={false}/>
				</div>
				<div className={'margin-lg'}>
					<Button type={'primary'} onClick={() => history.push(`/ui/world/${currentWorld._id}/model/${model._id}/edit`)}>Edit<EditOutlined /></Button>
				</div>
			</Col>
			<Col span={12}>
				<div style={{width: 500, height: 750}}>
					<ModelViewer model={model}/>
				</div>
			</Col>
		</Row>
	</>;
};
