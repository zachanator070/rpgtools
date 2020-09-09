import React, {useState} from 'react';
import {useGetModels} from "../../hooks/useGetModels";
import {Row, Col, List, Button} from "antd";
import {Route, Switch, useRouteMatch} from "react-router-dom";
import {PermissionModal} from "../modals/PermissionModal";
import {MODEL} from "../../../../common/src/type-constants";
import {TeamOutlined} from '@ant-design/icons';
import {LoadingView} from "../LoadingView";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {CreateModelModal} from './CreateModelModal';


export const ModelView = () => {
	const {models, loading} = useGetModels();
	const {currentWorld, loading: worldLoading} = useCurrentWorld();

	const [selectedModel, setSelectedModel] = useState();
	const match = useRouteMatch();
	const [permissionModalVisibility, setPermissionModalVisibility] = useState(false);
	const [createModelModalVisibility, setCreateModelModalVisibility] = useState(false);

	if(loading || worldLoading){
		return <LoadingView/>;
	}

	return <>
		<Row>
			<Col span={4}>
				{currentWorld.canAddModels &&
					<>
					<Button className={'margin-lg'} onClick={async () => {await setCreateModelModalVisibility(true)}}>Create Model</Button>
					<CreateModelModal visibility={createModelModalVisibility} setVisibility={setCreateModelModalVisibility}/>
					</>
				}
				<h1 className={'margin-lg-left'}>Models</h1>
				<List
					className={'margin-lg'}
					dataSource={models || []}
					locale={{emptyText: <>No Models</>}}
					renderItem={(model) => {
						return <List.Item key={model._id}>
							<a onClick={async () => await setSelectedModel(model)}>{model.name}</a>
						</List.Item>;
					}}
					/>
			</Col>
			<Col span={16}>
				{selectedModel && <>
					<Switch>
						<Route path={`${match.path}/edit`}>
							<ModelEdit/>
						</Route>
						<Route path={`${match.path}/view`}>
							<div>
								<ModelContent selectedModel={selectedModel}/>
							</div>
						</Route>
					</Switch>
				</>}
			</Col>
			<Col span={4}>
				{selectedModel &&
				<Route path={`${match.path}/view`}>
					<a title={'View permissions for this page'} onClick={async () => {
						await setPermissionModalVisibility(true);
					}}>
						<TeamOutlined style={{fontSize: '20px'}}/>
					</a>
					<PermissionModal
						visibility={permissionModalVisibility}
						setVisibility={setPermissionModalVisibility}
						subject={selectedModel}
						subjectType={MODEL}
					/>
				</Route>
				}
			</Col>
		</Row>

	</>;
}