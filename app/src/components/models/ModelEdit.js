import React from 'react';
import {ModelForm} from "./ModelForm";
import Errors from "../Errors";
import {Row, Col, Button, Modal} from "antd";
import useUpdateModel from "../../hooks/model/useUpdateModel";
import {useHistory} from 'react-router-dom';
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {LoadingView} from "../LoadingView";
import {useDeleteModel} from "../../hooks/model/useDeleteModel";

export const ModelEdit = ({model}) => {

	const {updateModel, loading} = useUpdateModel();
	const {currentWorld, loading: worldLoading} = useCurrentWorld();
	const history = useHistory();
	const {deleteModel} = useDeleteModel(() => {
		history.push(`/ui/world/${currentWorld._id}/model`);
	})

	if(!model){
		return <Errors errors={['You do not have permission to view this model or this model does not exist']}/>;
	}

	if(!model.canWrite){
		return <Errors errors={['You do not have permission to edit this model']}/>;
	}

	if(worldLoading){
		return <LoadingView/>;
	}

	return <div className={'margin-lg'}>
		<Row>
			<Col span={10}>
				<h1>Edit {model.name}</h1>
				<div className={'margin-lg'}>
					<ModelForm
						callback={async (values) => {
							await updateModel(model._id, values.name, values.file ? values.file[0].originFileObj : null, values.depth, values.width, values.height);
							history.push(`/ui/world/${currentWorld._id}/model/${model._id}/view`);
						}}
						initialValues={model}
						fileRequired={false}
						loading={loading}
					/>
					<Button type={'danger'} onClick={() => {
						Modal.confirm({
							title: 'Confirm',
							content: `Are you sure you want to delete the model ${model.name} ?`,
							cancelText: 'Cancel',
							okText: 'Delete Model',
							onOk: async () => {
								await deleteModel({modelId: model._id});
							}
						});
					}}>Delete Model</Button>
				</div>
			</Col>
			<Col span={14}/>
		</Row>

	</div>
};